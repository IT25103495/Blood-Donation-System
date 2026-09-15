package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentResponseDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentStatusUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Appointment.appointmentUpdateDTO;
import com.b7g2_08.blooddonationsystem.Enums.appStatus;
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

    //create appointment
    @PostMapping()
    public @ResponseBody String addAppointment(@RequestBody appointmentCreateDTO appointmentCreateDTO) {

        return appointmentService.addNewAppointment(appointmentCreateDTO);
    }

    // view all appointments
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public @ResponseBody List<appointmentResponseDTO> getAllAppointments() {

        return appointmentService.getAllAppointments();
    }

    //view appointment by id
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public @ResponseBody appointmentResponseDTO getAppointmentById(@PathVariable int id) {
        return appointmentService.getAppointmentById(id);
    }

    //update appointment
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public @ResponseBody String updateAppointment(@PathVariable int id,@RequestBody appointmentUpdateDTO appointmentUpdateDTO) {
        return appointmentService.updateAppointment(id, appointmentUpdateDTO);
    }

    //update appointment status
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/status")
    public @ResponseBody String updateAppointmentStatus(@PathVariable int id,@RequestBody appointmentStatusUpdateDTO status) {
        return appointmentService.updateAppointmentStatus(id, status);
    }

    //delete appointment
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public @ResponseBody String deleteAppointment(@PathVariable int id) {
        return appointmentService.deleteAppointment(id);
    }

}
