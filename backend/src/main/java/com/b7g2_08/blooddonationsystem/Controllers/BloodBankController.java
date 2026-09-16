package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Bank.bankCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Bank;
import com.b7g2_08.blooddonationsystem.Services.BankService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/api/bloodBank")
public class BloodBankController {

    @Autowired
    private BankService bankService;

    //View All banks
    @GetMapping(path="/getAll")
    public @ResponseBody Iterable<Bank> getAllBanks(){
        return bankService.getAllBloodBanks();
    }

    //View a specific blood bank by ID
    @GetMapping(path = "/getById")
    public @ResponseBody ResponseEntity<Bank> getBankById(@RequestBody Integer id) {
        return bankService.getBloodBankByID(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //Add a new bank
    @PostMapping(path = "/add")
    public @ResponseBody String addBank(@RequestBody bankCreateDTO bank){
        return bankService.createBloodBank(bank);
    }

    //Update existing bank
    @PutMapping(path = "/update/{id}")
    public @ResponseBody ResponseEntity<Bank> updateBank(@PathVariable int id, @RequestBody Bank bank){
        Bank updatedBank = bankService.updateBloodBank(id, bank);
        return ResponseEntity.ok(updatedBank);
    }

    //Delete blood bank
    @DeleteMapping(path = "/delete/{id}")
    public @ResponseBody ResponseEntity<String> deleteBank(@PathVariable int id){
        bankService.deleteBloodBank(id);
        return ResponseEntity.ok("Blood bank deleted successfully.");
    }
}

