namespace backend_EventMoment.Services.Exceptions
{
    public class InvalidCredentialsException : Exception
    {
        public InvalidCredentialsException()
            : base("Email ou mot de passe incorrect.") { }
    }
}