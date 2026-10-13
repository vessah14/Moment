using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace backend_EventMoment.Dtos
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
    public sealed class JsonDocumentAttribute : ValidationAttribute
    {
        public JsonDocumentAttribute()
            : base("{0} must contain valid JSON.")
        {
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is not string json || string.IsNullOrWhiteSpace(json))
                return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));

            try
            {
                using var _ = JsonDocument.Parse(json);
                return ValidationResult.Success;
            }
            catch (JsonException)
            {
                return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
            }
        }
    }
}
