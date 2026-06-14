package com.evre.controller;

import com.evre.dto.UserDto;
import com.evre.model.User;
import com.evre.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController<User, UserDto, Long> {

    @Autowired
    public UserController(UserService userService) {
        super(userService);
    }

    @Override
    @PostMapping
    public ResponseEntity<UserDto> create(@RequestBody UserDto userDto) {
        return super.create(userDto);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getById(@PathVariable Long id) {
        return super.getById(id);
    }

    @Override
    @GetMapping
    public ResponseEntity<List<UserDto>> getAll() {
        return super.getAll();
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @RequestBody UserDto userDto) {
        return super.update(id, userDto);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return super.delete(id);
    }
}
