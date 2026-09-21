package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Request.*;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.b7g2_08.blooddonationsystem.Services.RequestService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/request")
public class RequestController {

    @Autowired
    RequestService requestService;

    //create
    @PreAuthorize("hasRole('HOSPITAL')")
    @PostMapping()
    public @ResponseBody String addNewRequest(@Valid @RequestBody requestCreateDTO request, @AuthenticationPrincipal  AuthEntity me) {
        return requestService.addNewRequest(request, me.getHospital().getID());
    }

    //update
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping()
    public @ResponseBody String updateRequest(@Valid @RequestBody requestUpdateDTO request) {
        return requestService.updateRequest(request);
    }

    //view all
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public @ResponseBody List<requestResponseDTO> getRequests() {
        return requestService.getAllRequests();
    }

    //view my requests (hospital)
    @PreAuthorize("hasRole('HOSPITAL')")
    @GetMapping("/me")
    public @ResponseBody List<requestResponseDTO> getMyRequests(@AuthenticationPrincipal AuthEntity me) {
        return requestService.getRequestsByHospital(me.getHospital().getID());
    }

    //view my request by id (hospital)
    @PreAuthorize("hasRole('HOSPITAL')")
    @GetMapping("/me/{req_id}")
    public @ResponseBody requestResponseDTO getMyRequestByID(@PathVariable int req_id, @AuthenticationPrincipal AuthEntity me) {
        return requestService.getRequestByHospitalByReqID(req_id, me.getHospital().getID());
    }

    //view status of my request (hospital)
    @PreAuthorize("hasRole('HOSPITAL')")
    @GetMapping("/me/{req_id}/status")
    public @ResponseBody requestGetStatusDTO getMyRequestStatus(@PathVariable int req_id, @AuthenticationPrincipal AuthEntity me) {
        return requestService.getMyRequestStatus(req_id, me.getHospital().getID());
    }

    //cancel my request, only while PENDING (hospital)
    @PreAuthorize("hasRole('HOSPITAL')")
    @DeleteMapping("/me/{req_id}")
    public @ResponseBody String cancelMyRequest(@PathVariable int req_id, @AuthenticationPrincipal AuthEntity me) {
        return requestService.cancelMyRequest(req_id, me.getHospital().getID());
    }


    //view specific request
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{req_id}")
    public @ResponseBody requestResponseDTO getRequestByID(@PathVariable int req_id) {
        return requestService.getRequestById(req_id);
    }

    //get requests by hospital id
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/hospital/{hospital_id}")
    public @ResponseBody List<requestResponseDTO> getReqByHospital(@PathVariable int hospital_id) {
        return requestService.getRequestsByHospital(hospital_id);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping()
    public @ResponseBody String deleteRequest(@RequestParam int ID) {
        return requestService.deleteRequest(ID);
    }

    //complete request
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{req_id}/complete")
    public @ResponseBody String completeRequest(@PathVariable int req_id) {

        return requestService.completeReq(req_id);

    }

    //approve request
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{req_id}/approve")
    public @ResponseBody String approveRequest(@PathVariable int req_id) {

        return requestService.approveReq(req_id);

    }

    //reject request
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{req_id}/reject")
    public @ResponseBody String rejectRequest(@PathVariable int req_id) {

        return requestService.rejectReq(req_id);

    }
}
