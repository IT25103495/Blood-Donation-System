package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Appointment;
import com.b7g2_08.blooddonationsystem.Repos.AppointmentRepository;
import com.b7g2_08.blooddonationsystem.Services.AppointmentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepo;
    @Autowired
    private AppointmentService appointmentService;

    @PostMapping()
    public @ResponseBody String addAppointment(@RequestBody appointmentCreateDTO appointmentCreateDTO) {

        return appointmentService.addNewAppointment(appointmentCreateDTO);
    }

    @GetMapping()
    public @ResponseBody Iterable<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }
}
