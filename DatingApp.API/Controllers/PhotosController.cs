using DatingApp.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using CloudinaryDotNet;
using DatingApp.API.Helpers;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using DatingApp.API.Dtos;
using System.Security.Claims;
using CloudinaryDotNet.Actions;
using DatingApp.API.Models;
using System.Linq;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private Cloudinary _cloudinary;
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;

        public PhotosController(IDatingRepository repo, IMapper mapper,
                                IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _cloudinaryConfig = cloudinaryConfig;
            _mapper = mapper;
            _repo = repo;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);

        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id){
            var photoFromRepo = await _repo.GetPhoto(id);
            var photo = _mapper.Map<PhotoForReturnDto>(photoFromRepo);
            return Ok(photo);
        }


        [HttpPost]
        public async Task<IActionResult> AddPhotosForUser(int userId,
           [FromForm] PhotoForCreationDto photoForCreationDto)
        {
            //Check if current logged in user is the same person want to add the picture
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            //return user info from the db
            var userFromRepo = await _repo.GetUser(userId);

            //return the uploaded file 
            var file = photoForCreationDto.File;

            //init ImageUploadResult to retrive the request result.
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                //read the file inside a bit stream
                using (var stream = file.OpenReadStream())
                {
                    //init ImageUploadParameters 
                    var uploadParams = new ImageUploadParams()
                    {
                        //Set the bit stream, 
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation()
                                             .Width(500)
                                             .Height(500).Crop("fill").Gravity("face")
                    };

                    //upload the image to cloudinary
                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Url.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            var photo = _mapper.Map<Photo>(photoForCreationDto);
            if (!userFromRepo.Photos.Any(u => u.IsMain))
                photo.IsMain = true;

            userFromRepo.Photos.Add(photo);

           
            if (await _repo.SaveAll())
            {
                 var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);
                 
                return CreatedAtRoute("GetPhoto", new {id = photo.Id},photoToReturn);
            }

            return BadRequest("Could not add the photo");
        }

        /*
        For updayiongh a resiunce we can use
        HttpPut which replace
        Or
        HttpPatch which is replace a patch of resources
        */
        
        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id){
            //Check if current logged in user is the same person want to add the picture
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var userFromRepo = await _repo.GetUser(userId);

            if(!userFromRepo.Photos.Any(p => p.Id == id))
                return Unauthorized();
            
            var photoFromRepo = await _repo.GetPhoto(id);

            if(photoFromRepo.IsMain)
                return BadRequest("This is already the main photo.");

            var currentMainPhoto = await _repo.GetMainPhotoForUser(userId);
            currentMainPhoto.IsMain = false;

            photoFromRepo.IsMain = true;

            if( await _repo.SaveAll())
                return NoContent();

            return BadRequest("Could not set main photo.");

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id){
            //Check if current logged in user is the same person want to add the picture
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var userFromRepo = await _repo.GetUser(userId);

            if(!userFromRepo.Photos.Any(p => p.Id == id))
                return Unauthorized();
            
            var photoFromRepo = await _repo.GetPhoto(id);

            if(photoFromRepo.IsMain)
                return BadRequest("You cannot delete your main photo.");
            
            if (photoFromRepo.PublicId != null) {
                var deletionParam = new DeletionParams(photoFromRepo.PublicId);

                var result = _cloudinary.Destroy(deletionParam);

                if (result.Result == "ok")
                    _repo.Delete(photoFromRepo);
                else
                    return BadRequest("Failed to delete from Cloudinary.");
            }

            if (photoFromRepo.PublicId == null)
                _repo.Delete(photoFromRepo);
                
            //Delete the photo from the database
            if(await _repo.SaveAll())
                return Ok();
                
            return BadRequest("Failed to delete the photo from DB.");
        }
    }
}