namespace backend_EventMoment.Services.Exceptions;

public sealed class IdempotencyConflictException(string message) : Exception(message);
