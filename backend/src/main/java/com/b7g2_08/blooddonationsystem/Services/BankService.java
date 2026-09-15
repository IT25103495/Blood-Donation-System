package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.Models.Bank;
import com.b7g2_08.blooddonationsystem.Repos.BankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BankService {
    @Autowired
    private BankRepository bankRepository;

    //View all banks
    public Iterable<Bank> getAllBloodBanks(){
        return bankRepository.findAll();
    }

    //View specific bank by ID
    public Optional<Bank> getBloodBankbyID(Integer id){
        return bankRepository.findById(id);
    }

    //Add new blood bank with validation
    public Bank createBloodBank(Bank bank){
        if(bank.getName()==null||bank.getName().trim().isEmpty()){
            throw new IllegalArgumentException("Blood bank name is required.");
        }
        if(bank.getAddress()==null||bank.getAddress().trim().isEmpty()){
            throw new IllegalArgumentException("Blood bank address is required.");
        }
        return bankRepository.save(bank);
    }

    //Update existing bank
    public Bank updateBloodBank(Integer id, Bank updatedBankDetails) {
        Bank existingBank = bankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blood bank not found with ID: " + id));

        if (updatedBankDetails.getName() != null && !updatedBankDetails.getName().trim().isEmpty()) {
            existingBank.setName(updatedBankDetails.getName());
        }
        if (updatedBankDetails.getAddress() != null && !updatedBankDetails.getAddress().trim().isEmpty()) {
            existingBank.setAddress(updatedBankDetails.getAddress());
        }

        return bankRepository.save(existingBank);
    }

    //Delete a bank
    public void deleteBloodBank(Integer id) {
        if (bankRepository.existsById(id)) {
            throw new RuntimeException("Blood bank not found with ID: " + id);
        }

        //Data integrity violation(Check the bank got active inventories)
        try{
            bankRepository.deleteById(id);
        } catch(DataIntegrityViolationException e){
            throw new RuntimeException("Cannot delete this blood bank because it currently holds active inventory.");
        }
    }

}
