package com.job.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.job.service.StorageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storageService;

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        Resource resource = storageService.loadAsResource(filename);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/preview/{filename:.+}")
    public ResponseEntity<Resource> previewFile(@PathVariable String filename) {
        Resource resource = storageService.loadAsResource(filename);
        
        // Default to application/pdf since resumes are usually PDFs
        String contentType = "application/pdf";
        
        if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
        if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
        if (filename.toLowerCase().endsWith(".doc")) contentType = "application/msword";
        if (filename.toLowerCase().endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
