using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using System.Linq;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfile: Profile
    {
        public AutoMapperProfile()
        {
            // From => To
            CreateMap<User,UserForListDto>()
                .ForMember(dest => dest.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p=> p.IsMain).Url);
                })
                .ForMember(dest => dest.Age, 
                opt => {
                    opt.ResolveUsing(d => d.DateOfBirth.CaulcateAge());
                });

            CreateMap<User,UserForDetailedDto>()
                .ForMember(dest => dest.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p=> p.IsMain).Url);
                })
                .ForMember(dest => dest.Age, 
                opt => {
                    opt.ResolveUsing(d => d.DateOfBirth.CaulcateAge());
                });

            CreateMap<Photo,PhotoForDetailedDto>();
            CreateMap<UserForUpdateDto,User>();
            CreateMap<Photo, PhotoForReturnDto>();  
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<UserForRegisterDto, User>();
        }
    }
}