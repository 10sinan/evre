package com.evre.service.impl;

import com.evre.model.BaseEntity;
import com.evre.repository.BaseRepository;
import com.evre.service.BaseService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

public abstract class BaseServiceImpl<T, D, ID, R extends BaseRepository<T, ID>> implements BaseService<T, D, ID> {

    protected final R repository;

    @Autowired
    protected BaseServiceImpl(R repository) {
        this.repository = repository;
    }

    protected abstract D mapToDto(T entity);
    protected abstract T mapToEntity(D dto);

    @Override
    public D save(D dto) {
        T entity = mapToEntity(dto);
        T savedEntity = repository.save(entity);
        return mapToDto(savedEntity);
    }

    @Override
    public D findById(ID id) {
        T entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return mapToDto(entity);
    }

    @Override
    public List<D> findAll() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(ID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public D update(ID id, D dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        T entity = mapToEntity(dto);
        if (entity instanceof BaseEntity) {
            ((BaseEntity) entity).setId((Long) id);
        }
        T updatedEntity = repository.save(entity);
        return mapToDto(updatedEntity);
    }
}
