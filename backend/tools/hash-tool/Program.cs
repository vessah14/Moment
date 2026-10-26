if (args.Length != 0)
{
    Console.Error.WriteLine("Usage: dotnet run --project backend/tools/hash-tool");
    return;
}

Console.Write("Nouveau mot de passe (saisie masquée) : ");
var password = ReadPassword();
Console.WriteLine();

if (password.Length < 12)
{
    Console.Error.WriteLine("Choisissez un mot de passe d'au moins 12 caractères.");
    return;
}

Console.WriteLine("Hash BCrypt à copier dans Neon (ce hash ne révèle pas le mot de passe) :");
Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(password));

static string ReadPassword()
{
    var password = new System.Text.StringBuilder();
    while (true)
    {
        var key = Console.ReadKey(intercept: true);
        if (key.Key == ConsoleKey.Enter)
            break;
        if (key.Key == ConsoleKey.Backspace)
        {
            if (password.Length > 0)
                password.Length--;
            continue;
        }
        if (!char.IsControl(key.KeyChar))
            password.Append(key.KeyChar);
    }
    return password.ToString();
}
