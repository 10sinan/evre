package com.evre.service;

import java.util.List;

public interface BaseService<T, D, ID> {
    D save(D dto);
    D findById(ID id);
    List<D> findAll();
    void deleteById(ID id);
    D update(ID id, D dto);
}
