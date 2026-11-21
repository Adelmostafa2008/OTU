using System;
using Amazon.S3;

namespace backend.Repos.interfaces;

public interface IFilebaseClient
{
    AmazonS3Client CreateClient();
}
