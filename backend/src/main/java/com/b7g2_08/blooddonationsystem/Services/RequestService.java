package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Request.requestCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Request.requestUpdateDTO;
import com.b7g2_08.blooddonationsystem.Enums.reqStatus;
import com.b7g2_08.blooddonationsystem.Models.Request;
import com.b7g2_08.blooddonationsystem.Models.Users.Hospital;
import com.b7g2_08.blooddonationsystem.Repos.RequestRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HospitalUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RequestService {
    @Autowired
    RequestRepository requestRepo;
    @Autowired
    private HospitalUserRepository hospitalRepo;

    @Transactional
    public @ResponseBody String addNewRequest(requestCreateDTO _request) {
        Request request = new Request();

        Hospital hospital = hospitalRepo.findById(_request.getHospitalID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!"));

        request.setDeadline(_request.getDeadline());
        request.setQuantities(_request.getQuantities());
        request.setHospital(hospital);
        request.setStatus(reqStatus.PENDING);

        requestRepo.save(request);
        return "Saved";
    }

    //FIXME: Update the DTO and this method so unset values don't get replaced
    @Transactional
    public @ResponseBody String updateRequest(requestUpdateDTO _request) {
        Request request = requestRepo.findById(_request.getReqID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found!"));

        Hospital hospital = hospitalRepo.findById(_request.getHospitalID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!"));

        request.setDeadline(_request.getDeadline());
        request.setQuantities(_request.getQuantities());
        request.setHospital(hospital);
        request.setStatus(reqStatus.PENDING);

        requestRepo.save(request);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String deleteRequest(int ID) {
        if (requestRepo.existsById(ID)) {
            requestRepo.deleteById(ID);
            return "Deleted";
        }
        else return "Not Found";
    }
}
