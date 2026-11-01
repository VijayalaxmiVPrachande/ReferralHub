package com.job.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.job.exception.BadRequestException;
import com.job.exception.ForbiddenException;
import com.job.exception.NotFoundException;
import com.job.service.StorageService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileSystemStorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public FileSystemStorageServiceImpl(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize upload directory at {}", rootLocation, e);
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file cannot be empty");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Resume file size exceeds maximum limit of 5 MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BadRequestException("Invalid resume filename");
        }

        String cleaned = StringUtils.cleanPath(originalFilename);
        String extension = "";
        int dotIdx = cleaned.lastIndexOf('.');
        if (dotIdx >= 0) {
            extension = cleaned.substring(dotIdx).toLowerCase(Locale.ROOT);
        }

        if (!extension.equals(".pdf") && !extension.equals(".docx")) {
            throw new BadRequestException("Invalid file format. Only PDF and DOCX files are allowed");
        }

        String newFilename = UUID.randomUUID() + extension;
        Path destinationFile = this.rootLocation.resolve(newFilename).normalize().toAbsolutePath();

        if (!destinationFile.startsWith(this.rootLocation)) {
            throw new ForbiddenException("Cannot store file outside target upload directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            return newFilename;
        } catch (IOException e) {
            log.error("Failed to store file {}", originalFilename, e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public Resource loadAsResource(String filename) {
        if (filename == null || filename.isBlank()) {
            throw new NotFoundException("Resume not found");
        }

        try {
            Path file = rootLocation.resolve(filename).normalize().toAbsolutePath();
            if (!file.startsWith(this.rootLocation)) {
                throw new ForbiddenException("Access denied: invalid file path");
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new NotFoundException("Resume file not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new NotFoundException("Resume file could not be read: " + filename);
        }
    }

    @Override
    public void delete(String filename) {
        if (filename == null || filename.isBlank()) {
            return;
        }
        try {
            Path file = rootLocation.resolve(filename).normalize().toAbsolutePath();
            if (file.startsWith(this.rootLocation)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", filename, e.getMessage());
        }
    }
}
