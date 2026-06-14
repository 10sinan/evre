package com.evre.service.impl;

import com.evre.dto.UserDto;
import com.evre.model.User;
import com.evre.repository.UserRepository;
import com.evre.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl extends BaseServiceImpl<User, UserDto, Long, UserRepository> implements UserService {

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        super(userRepository);
    }

    @Override
    protected UserDto mapToDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .build();
    }

    @Override
    protected User mapToEntity(UserDto userDto) {
        if (userDto == null) return null;
        return User.builder()
                .id(userDto.getId())
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .build();
    }

    @Override
    public UserDto save(UserDto userDto) {
        User user = User.builder()
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .build();
        User savedUser = repository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    public UserDto findById(Long id) {
        User user = repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    @Override
    public List<UserDto> findAll() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        repository.deleteById(id);
    }

    @Override
    public UserDto update(Long id, UserDto userDto) {
        User user = repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        User updatedUser = repository.save(user);
        return mapToDto(updatedUser);
    }

    // --- Legacy / UserService specific methods ---

    @Override
    public UserDto createUser(UserDto userDto) {
        return save(userDto);
    }

    @Override
    public UserDto getUserById(Long id) {
        return findById(id);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return findAll();
    }

    @Override
    public UserDto updateUser(Long id, UserDto userDto) {
        return update(id, userDto);
    }

    @Override
    public void deleteUser(Long id) {
        deleteById(id);
    }
}
