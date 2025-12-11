<?php


namespace App\Service;

use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\UrlHelper;
use Symfony\Component\String\Slugger\SluggerInterface;

class FileUploader
{
    private $uploadPath;
    private $slugger;
    private $urlHelper;
    private $relativeUploadsDir;

    public function __construct($publicPath, $uploadPath, SluggerInterface $slugger, UrlHelper $urlHelper)
    {
        $this->uploadPath = $uploadPath;
        $this->slugger = $slugger;
        $this->urlHelper = $urlHelper;

        // get uploads directory relative to public path //  "/uploads/"
        $this->relativeUploadsDir = str_replace($publicPath, '', $this->uploadPath) . '/';
    }

    public function upload(UploadedFile $file)
    {
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug(strtolower($originalFilename));
        $fileName = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

        try {
            $file->move($this->getuploadPath(), $fileName);
        } catch (FileException $e) {
            // ... handle exception if something happens during file upload
        }

        return $fileName;
    }

    public function getuploadPath()
    {
        return $this->uploadPath;
    }

    public function getUrl(?string $fileName, bool $absolute = true)
    {
        if (empty($fileName)) return null;

        if (filter_var($fileName, FILTER_VALIDATE_URL)) {
            return $fileName;
        }

        if ($absolute) {
            return $this->urlHelper->getAbsoluteUrl($this->relativeUploadsDir . $fileName);
        }

        return $this->urlHelper->getRelativePath($this->relativeUploadsDir . $fileName);
    }
}
