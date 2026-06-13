package com.evre.service;

import com.evre.dto.TerminalRequest;

public interface TerminalService {
    String executeCommand(TerminalRequest request);
}
