namespace backend_EventMoment.Services.Exceptions
{
    public class EmailAlreadyExistsException :Exception
    {
        public EmailAlreadyExistsException(string email)
            :base($"un compte existe deja avec l'email '{email}"){}
    }
}