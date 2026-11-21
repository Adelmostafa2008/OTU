using System;
using Amazon.S3;
using backend.Repos.interfaces;

namespace backend.Service;

public class FilebaseClient : IFilebaseClient
{
     private readonly IConfiguration _config;
     public string apikey{get;set;}
     public string secretkey{get;set;}
        public FilebaseClient(IConfiguration config)
        {
            _config = config;
            apikey = _config["APIKey"];
            secretkey = _config["APISecret"];
        }

    public AmazonS3Client CreateClient()
    {
        var config = new AmazonS3Config
        {
            ServiceURL = "https://s3.filebase.io",
            ForcePathStyle = true,
            AuthenticationRegion = "auto",
        };
        return new AmazonS3Client(apikey , secretkey , config);
    }
}
