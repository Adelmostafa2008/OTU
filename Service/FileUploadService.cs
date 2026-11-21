using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3.Internal;
using Amazon.S3.Model;
using Amazon.S3.Util;
using backend.Repos.interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.VisualBasic;

namespace backend.Service
{
    public class files
    {
        public string filename{get;set;}
        public int size {get;set;}
        public string content_type {get;set;}
    }
    public class Structure
    {
        public string Faculty {get;set;}
        public string Division {get;set;}
        public string type {get;set;}
        public string subject {get;set;}
    }
    public class UploadCloudResult
    {
        public string key {get;set;}
        public PutObjectResponse response {get;set;}
    }
    public class FileUploadService
    {
        private readonly IConfiguration _config;
        private readonly IFilebaseClient _s3;

        public FileUploadService(IConfiguration config , IFilebaseClient s3)
        {
            _s3 = s3;
            _config = config;
        }

        public async Task<UploadCloudResult> UploadFile(IFormFile file , Structure sort)
        {
            var client = _s3.CreateClient();
            var BucketExists = await AmazonS3Util.DoesS3BucketExistV2Async(client , _config["BucketName"]);
            if (!BucketExists)
            {
                var bucketrequest = new PutBucketRequest()
                {
                    BucketName = _config["BucketName"],
                    UseClientRegion = true
                };

                await client.PutBucketAsync(bucketrequest);
            }
            var customKey = UniqueObjectKey(file.FileName , sort);
            PutObjectRequest objectRequest = new PutObjectRequest()
            {
                BucketName = _config["BucketName"],
                InputStream = file.OpenReadStream(),
                Key = customKey
            };

            var response =  await client.PutObjectAsync(objectRequest);
            return new UploadCloudResult{key = customKey , response = response};
        }

        public string UniqueObjectKey(string name , Structure sort)
        {
            var res = $"{sort.Faculty}/{sort.Division}/{sort.subject}/{sort.type}/{DateTime.Now:MM-dd-hh-mm-ss}-{name}";
            return res;
        }

        public async Task<string> getFile (string filename)
        {
            var client = _s3.CreateClient();

            var request = new GetPreSignedUrlRequest()
            {
                BucketName = _config["BucketName"],
                Key = filename,
                Expires = DateTime.UtcNow.AddSeconds(40)
            };

            var result = await client.GetPreSignedURLAsync(request);

            return result;
        }

        public async Task<IEnumerable<string>> getfiles(string prefix)
        {
            var client = _s3.CreateClient();

            var request = new ListObjectsV2Request()
            {
                BucketName = _config["BucketName"],
                Prefix = prefix
            };

            var response = await client.ListObjectsV2Async(request);
           
            var result = response.S3Objects.Select( item =>
            {
                var request = new GetPreSignedUrlRequest()
                {
                    BucketName = _config["BucketName"],
                    Key = item.Key,
                    Expires = DateTime.UtcNow.AddSeconds(60)
                } ;

                return client.GetPreSignedURL(request);
            });

            return result;
            
        }

        public async Task DeleteFile(string filename)
        {
            var client = _s3.CreateClient();

            await client.DeleteObjectAsync(_config["BucketName"] , filename);
        }
    }
}