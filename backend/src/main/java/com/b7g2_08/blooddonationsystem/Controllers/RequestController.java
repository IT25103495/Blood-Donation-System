package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Request.requestCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Request.requestGetStatusDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Request.requestUpdateDTO;
import com.b7g2_08.blooddonationsystem.Models.Request;
import com.b7g2_08.blooddonationsystem.Repos.RequestRepository;
import com.b7g2_08.blooddonationsystem.Services.RequestService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/request")
public class RequestController {
    @Autowired
    RequestRepository requestRepo;
    @Autowired
    RequestService requestService;

    @PostMapping(path="/add")
    public @ResponseBody String addNewRequest(@RequestBody requestCreateDTO request) {
        return requestService.addNewRequest(request);
    }

    @PutMapping(path="/update")
    public @ResponseBody String updateRequest(@RequestBody requestUpdateDTO request) {
        return requestService.updateRequest(request);
    }

    @GetMapping(path="/getAll")
    public @ResponseBody Iterable<Request> getRequests() {
        return requestRepo.findAll();
    }

    @GetMapping(path="/getById")
    public @ResponseBody ResponseEntity<Request> getRequestByID(@RequestParam int ID) {
        return requestRepo.findById(ID)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping(path="/delete")
    public @ResponseBody String deleteRequest(@RequestParam int ID) {
        return requestService.deleteRequest(ID);
    }

    //get request status

    @GetMapping("/{req_id}/status")
    public @ResponseBody requestGetStatusDTO getReqStatus(@PathVariable int req_id) {

        return requestService.getReqStatus(req_id);
    }
}
