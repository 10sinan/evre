package com.evre.controller;

import com.evre.service.BaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class BaseController<T, D, ID> {

    protected final BaseService<T, D, ID> service;

    protected BaseController(BaseService<T, D, ID> service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<D> create(@RequestBody D dto) {
        return ResponseEntity.ok(service.save(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<D> getById(@PathVariable ID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<D>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<D> update(@PathVariable ID id, @RequestBody D dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
