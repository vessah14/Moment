namespace backend_EventMoment.Services.Exceptions
{
    public class AccountInactiveException : Exception
    {
        public AccountInactiveException()
            : base("Ce compte a été désactivé.") { }
    }
}