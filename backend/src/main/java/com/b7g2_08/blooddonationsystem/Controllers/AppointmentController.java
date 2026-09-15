package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentResponseDTO;
import com.b7g2_08.blooddonationsystem.Services.AppointmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping()
    public @ResponseBody String addAppointment(@RequestBody appointmentCreateDTO appointmentCreateDTO) {

        return appointmentService.addNewAppointment(appointmentCreateDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public @ResponseBody List<appointmentResponseDTO> getAllAppointments() {

        return appointmentService.getAllAppointments();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public @ResponseBody appointmentResponseDTO getAppointmentById(@PathVariable int id) {
        return appointmentService.getAppointmentById(id);
    }


}
