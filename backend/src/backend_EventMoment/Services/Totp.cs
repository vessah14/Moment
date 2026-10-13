using System.Security.Cryptography;

namespace backend_EventMoment.Services
{
    // Codes à usage unique basés sur le temps (RFC 6238 : HMAC-SHA1, 30 s, 6 chiffres),
    // compatibles Google Authenticator, Microsoft Authenticator, 1Password, Authy…
    public static class Totp
    {
        private const int StepSeconds = 30;
        private const string Base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

        public static string GenerateSecret()
        {
            var bytes = RandomNumberGenerator.GetBytes(20); // 160 bits, recommandé par la RFC 4226
            return ToBase32(bytes);
        }

        public static long CurrentStep(DateTimeOffset now) => now.ToUnixTimeSeconds() / StepSeconds;

        public static string Code(string base32Secret, long step)
        {
            Span<byte> counter = stackalloc byte[8];
            for (var i = 7; i >= 0; i--) { counter[i] = (byte)(step & 0xFF); step >>= 8; }
            var hash = HMACSHA1.HashData(FromBase32(base32Secret), counter);
            var offset = hash[^1] & 0x0F;
            var binary = ((hash[offset] & 0x7F) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3];
            return (binary % 1_000_000).ToString("D6");
        }

        // Accepte le pas courant et ses voisins (horloge du téléphone décalée de ±30 s),
        // mais jamais un pas déjà utilisé (rejeu d'un code intercepté). Renvoie le pas accepté.
        public static long? Verify(string base32Secret, string? code, long lastUsedStep, DateTimeOffset now)
        {
            var digits = new string((code ?? "").Where(char.IsDigit).ToArray());
            if (digits.Length != 6) return null;
            var current = CurrentStep(now);
            for (var step = current - 1; step <= current + 1; step++)
            {
                if (step <= lastUsedStep) continue;
                if (CryptographicOperations.FixedTimeEquals(
                        System.Text.Encoding.ASCII.GetBytes(Code(base32Secret, step)),
                        System.Text.Encoding.ASCII.GetBytes(digits)))
                    return step;
            }
            return null;
        }

        public static string ProvisioningUri(string accountEmail, string base32Secret) =>
            $"otpauth://totp/{Uri.EscapeDataString("TBF Moment Admin")}:{Uri.EscapeDataString(accountEmail)}"
            + $"?secret={base32Secret}&issuer={Uri.EscapeDataString("TBF Moment Admin")}&algorithm=SHA1&digits=6&period=30";

        private static string ToBase32(byte[] data)
        {
            var output = new System.Text.StringBuilder();
            int buffer = 0, bits = 0;
            foreach (var b in data)
            {
                buffer = (buffer << 8) | b; bits += 8;
                while (bits >= 5) { output.Append(Base32Alphabet[(buffer >> (bits - 5)) & 31]); bits -= 5; }
            }
            if (bits > 0) output.Append(Base32Alphabet[(buffer << (5 - bits)) & 31]);
            return output.ToString();
        }

        private static byte[] FromBase32(string text)
        {
            var clean = text.Trim().TrimEnd('=').ToUpperInvariant();
            var output = new List<byte>();
            int buffer = 0, bits = 0;
            foreach (var c in clean)
            {
                var value = Base32Alphabet.IndexOf(c);
                if (value < 0) throw new FormatException("Secret TOTP invalide.");
                buffer = (buffer << 5) | value; bits += 5;
                if (bits >= 8) { output.Add((byte)((buffer >> (bits - 8)) & 0xFF)); bits -= 8; }
            }
            return output.ToArray();
        }
    }
}
