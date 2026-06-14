package com.evre.service;

import com.evre.dto.UserDto;
import com.evre.model.User;
import java.util.List;

public interface UserService extends BaseService<User, UserDto, Long> {
    UserDto createUser(UserDto userDto);
    UserDto getUserById(Long id);
    List<UserDto> getAllUsers();
    UserDto updateUser(Long id, UserDto userDto);
    void deleteUser(Long id);
}
