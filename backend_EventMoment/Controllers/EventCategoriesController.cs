using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend_EventMoment.Dtos;
using backend_EventMoment.Interfaces;

namespace backend_EventMoment.Controllers
{
    [ApiController]
    [Route("api/event-categories")]
    [Authorize]
    public class EventCategoriesController : ControllerBase
    {
        private readonly IEventCategoryService _service;

        public EventCategoriesController(IEventCategoryService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateEventCategoryDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventCategoryDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "SuperadminOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }
    }
}
