package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Bank.bankCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Bank;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Repos.BankRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class BankService {
    @Autowired
    private BankRepository bankRepository;
    @Autowired
    private AdminUserRepository adminRepo;

    //View all banks
    public Iterable<Bank> getAllBloodBanks(){
        return bankRepository.findAll();
    }

    //View specific bank by ID
    public Optional<Bank> getBloodBankByID(Integer id){
        return bankRepository.findById(id);
    }

    //Add new blood bank with validation
    public @ResponseBody String createBloodBank(bankCreateDTO _bank){
        if(_bank.getName()==null||_bank.getName().trim().isEmpty()){
            throw new IllegalArgumentException("Blood bank name is required.");
        }
        if(_bank.getAddress()==null||_bank.getAddress().trim().isEmpty()){
            throw new IllegalArgumentException("Blood bank address is required.");
        }
        Bank bank = new Bank();

        Admin manager = adminRepo.findById(_bank.getManagerID()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager Not Found!"));

        bank.setName(_bank.getName());
        bank.setAddress(_bank.getAddress());
        bank.setManager(manager);

        bankRepository.save(bank);

        return "Saved";
    }

    //Update existing bank
    //FIXME: Convert to an updateBankDTO *please*
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
