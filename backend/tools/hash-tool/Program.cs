if (args.Length != 1)
{
    Console.Error.WriteLine("Usage: hash-tool <password>");
    return;
}

Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(args[0]));
