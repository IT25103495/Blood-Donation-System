package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Request.*;
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

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RequestService {
    @Autowired
    RequestRepository requestRepo;
    @Autowired
    private HospitalUserRepository hospitalRepo;

    // PENDING can be decided or expire, APPROVED can be completed, everything else is final
    private void checkTransition(reqStatus cur, reqStatus next) {
        if (cur == next) return;

        boolean ok = switch (cur) {
            case PENDING -> next == reqStatus.APPROVED || next == reqStatus.REJECTED || next == reqStatus.EXPIRED;
            case APPROVED -> next == reqStatus.COMPLETE;
            default -> false;
        };

        if (!ok) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot change status from " + cur + " to " + next);
        }
    }

    private void requireSomeUnits(List<Integer> quantities) {
        if (quantities.stream().mapToInt(Integer::intValue).sum() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request must ask for at least one unit");
        }
    }

    // 404 for both "missing" and "not yours" so hospitals can't probe other hospitals' request ids
    private Request loadOwnedRequest(int reqId, int hospitalId) {
        Request req = requestRepo.findById(reqId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found"));

        if (!req.getHospital().getID().equals(hospitalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found");
        }
        return req;
    }

    @Transactional
    public @ResponseBody String addNewRequest(requestCreateDTO _request, int hospitalId) {
        requireSomeUnits(_request.getQuantities());

        Request request = new Request();

        Hospital hospital = hospitalRepo.findById(hospitalId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!"));

        request.setDeadline(_request.getDeadline());
        request.setQuantities(_request.getQuantities());
        request.setHospital(hospital);
        request.setStatus(reqStatus.PENDING);

        requestRepo.save(request);
        return "Saved";
    }

    // full replace of quantities/deadline/hospital; status changes go through approve/reject/complete
    @Transactional
    public @ResponseBody String updateRequest(requestUpdateDTO _request) {
        Request request = requestRepo.findById(_request.getReqID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found!"));

        Hospital hospital = hospitalRepo.findById(_request.getHospitalID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!"));

        requireSomeUnits(_request.getQuantities());

        request.setDeadline(_request.getDeadline());
        request.setQuantities(_request.getQuantities());
        request.setHospital(hospital);

        requestRepo.save(request);
        return "Updated";
    }

    // approved / completed requests are kept as a record
    @Transactional
    public @ResponseBody String deleteRequest(int ID) {
        Request req = requestRepo.findById(ID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found"));

        if (req.getStatus() == reqStatus.APPROVED || req.getStatus() == reqStatus.COMPLETE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete a " + req.getStatus() + " request");
        }

        requestRepo.delete(req);
        return "Deleted";
    }

    // hospital cancels its own request, only while it is still undecided
    @Transactional
    public String cancelMyRequest(int reqId, int hospitalId) {
        Request req = loadOwnedRequest(reqId, hospitalId);

        if (req.getStatus() != reqStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PENDING requests can be cancelled (current: " + req.getStatus() + ")");
        }

        requestRepo.delete(req);
        return "Cancelled";
    }

    @Transactional
    public requestGetStatusDTO getMyRequestStatus(int reqId, int hospitalId) {
        return new requestGetStatusDTO(loadOwnedRequest(reqId, hospitalId).getStatus());
    }

    @Transactional
    public List<requestResponseDTO> getRequestsByHospital(int hospitalID) {
        if (!hospitalRepo.existsById(hospitalID)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital Not Found!");
        }
        return requestRepo.findByHospital_ID(hospitalID).stream()
                .map(requestResponseDTO::new).toList();
    }

    @Transactional
    public requestResponseDTO getRequestByHospitalByReqID(int reqId, int hospitalID) {
        return new requestResponseDTO(loadOwnedRequest(reqId, hospitalID));
    }

    @Transactional
    public List<requestResponseDTO> getAllRequests() {
        List<requestResponseDTO> result = new ArrayList<>();
        for (Request r : requestRepo.findAll()) result.add(new requestResponseDTO(r));
        return result;
    }

    @Transactional
    public requestResponseDTO getRequestById(int id) {
        Request r = requestRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found"));
        return new requestResponseDTO(r);
    }

    //complete request (only APPROVED requests)
    @Transactional
    public String completeReq(int reqId) {

        Request req = requestRepo.findById(reqId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found"));

        checkTransition(req.getStatus(), reqStatus.COMPLETE);
        if (req.getStatus() == reqStatus.COMPLETE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is already complete");
        }

        req.setStatus(reqStatus.COMPLETE);
        requestRepo.save(req);
        return "Completed";
    }


    //approve request
    @Transactional
    public String approveReq(int reqId) {

        Request req = requestRepo.findById(reqId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found"));

        checkTransition(req.getStatus(), reqStatus.APPROVED);
        if (req.getStatus() == reqStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is already approved");
        }
        if (req.getDeadline().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request deadline has passed");
        }

        req.setStatus(reqStatus.APPROVED);
        requestRepo.save(req);
        return "Approved";
    }

    //reject request
    @Transactional
    public String rejectReq(int reqId) {

        Request req = requestRepo.findById(reqId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request Not Found"));

        checkTransition(req.getStatus(), reqStatus.REJECTED);
        if (req.getStatus() == reqStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request is already rejected");
        }

        req.setStatus(reqStatus.REJECTED);
        requestRepo.save(req);
        return "Rejected";
    }
}
