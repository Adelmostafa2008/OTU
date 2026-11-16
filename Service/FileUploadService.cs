using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace backend.Service
{
    public class FileUploadService
    {
        private readonly Cloudinary _cloud;
        private readonly ConfigurationManager _config;

        public FileUploadService(ConfigurationManager config)
        {
            _config = config;
            var account = new Account(_config["Cloud:CloudName"] , _config["Cloud:APIKey"] , _config["Cloud:APISecret"]);
            _cloud = new Cloudinary(account);
        }

        public async Task<result> UploadFile(IFormFile file)
        {
            System.Console.WriteLine(_config["Cloud:CloudName"]);
            if (file.Length > 10 * 1024 * 1024) return new result{flag = false , msg = "A File cannot be larger than 10MB at a time."};

            var stream = file.OpenReadStream();
            var upload_params = new RawUploadParams
            {
                File = new FileDescription(file.FileName , stream),
                Folder = "OTUhub"
            };

            var result = await _cloud.UploadAsync(upload_params);

        if (result.Error != null)
        {
            return new result {flag = false , msg = $"Upload failed: {result.Error.Message}"};
        }

            return new result {flag = true , msg = result.SecureUrl.ToString()};
        }
    }
}