using System.Data.Common;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend_EventMoment.Data
{
    // Accès global ponctuel pendant une requête d'organisateur, pour les rares contrôles qui
    // portent sur toute la plateforme (ex. une adresse d'événement déjà prise ailleurs).
    // Les connexions ouvertes dans le bloc using voient toutes les lignes.
    public sealed class RlsBypass
    {
        private int _depth;
        public bool Active => _depth > 0;

        public IDisposable Begin()
        {
            _depth++;
            return new Scope(this);
        }

        private sealed class Scope(RlsBypass owner) : IDisposable
        {
            private bool _disposed;
            public void Dispose()
            {
                if (_disposed) return;
                _disposed = true;
                owner._depth--;
            }
        }
    }

    // Row Level Security PostgreSQL (migration 20261011_row_level_security.sql) : à chaque
    // ouverture de connexion, indique à la base pour qui elle travaille.
    //  - organisateur connecté → app.current_organizer_id = son id, app.rls_bypass = off :
    //    la base ne lui montre et ne lui laisse modifier que ses propres données, même si
    //    un contrôle manquait dans le code ;
    //  - visiteur anonyme (site public, connexion), console admin, tâches de fond →
    //    app.rls_bypass = on (ces accès sont globaux par nature).
    // Réglé à chaque ouverture : une connexion réutilisée du pool repart toujours propre.
    public sealed class RlsSessionInterceptor(IHttpContextAccessor httpContextAccessor, RlsBypass bypass) : DbConnectionInterceptor
    {
        private const string Sql =
            "SELECT set_config('app.current_organizer_id', @organizer, false), set_config('app.rls_bypass', @bypass, false)";

        public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
        {
            using var command = CreateCommand(connection);
            command.ExecuteNonQuery();
        }

        public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData,
            CancellationToken cancellationToken = default)
        {
            await using var command = CreateCommand(connection);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        private DbCommand CreateCommand(DbConnection connection)
        {
            var organizerId = bypass.Active ? null : CurrentOrganizerId();
            var command = connection.CreateCommand();
            command.CommandText = Sql;
            // Identifiant nul (et non vide) : reste un uuid valide pour les anciennes politiques.
            AddParameter(command, "organizer", (organizerId ?? Guid.Empty).ToString());
            AddParameter(command, "bypass", organizerId == null ? "on" : "off");
            return command;
        }

        private Guid? CurrentOrganizerId()
        {
            var user = httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true || user.FindFirst("type")?.Value != "organizer")
                return null;
            return Guid.TryParse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
        }

        private static void AddParameter(DbCommand command, string name, string value)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value;
            command.Parameters.Add(parameter);
        }
    }
}
