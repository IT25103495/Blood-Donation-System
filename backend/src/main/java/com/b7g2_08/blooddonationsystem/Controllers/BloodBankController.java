package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.Models.Bank;
import com.b7g2_08.blooddonationsystem.Services.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bloodbanks")
@CrossOrigin(origins = "*")

public class BloodBankController {

    @Autowired
    private BankService bankService;

    //View All banks
    @GetMapping
    public Iterable<Bank> getAllBanks(){
        return bankService.getAllBloodBanks();
    }

    //View a specific blood bank by ID
    @GetMapping("/{id}")
    public ResponseEntity<Bank> getBankById(@PathVariable Integer id) {
        return bankService.getBloodBankbyID(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //Add a new bank
    @PostMapping
    public ResponseEntity<Bank> addBank(@RequestBody Bank bank){
        Bank newBank = bankService.createBloodBank(bank);
        return ResponseEntity.ok(newBank);
    }

    //Update existing bank
    @PutMapping("/{id}")
    public ResponseEntity<Bank> updateBank(@PathVariable int id, @RequestBody Bank bank){
        Bank updatedBank = bankService.updateBloodBank(id, bank);
        return ResponseEntity.ok(updatedBank);
    }

    //Delete blood bank
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBank(@PathVariable int id){
        bankService.deleteBloodBank(id);
        return ResponseEntity.ok("Blood bank deleted successfully.");
    }
}

