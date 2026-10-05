package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.Abstracts.User;
import com.b7g2_08.blooddonationsystem.Auth.JwtUtil;
import com.b7g2_08.blooddonationsystem.DTOs.Admin.adminCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Admin.adminUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.TokenResponse;
import com.b7g2_08.blooddonationsystem.DTOs.Auth.authLoginDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Donor.donorCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Donor.donorUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hospital.hospitalCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hospital.hospitalUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hoster.hosterCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Hoster.hosterUpdateDTO;
import com.b7g2_08.blooddonationsystem.DesignPattern.User.*;
import com.b7g2_08.blooddonationsystem.Enums.bloodTypeList;
import com.b7g2_08.blooddonationsystem.Enums.userType;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.b7g2_08.blooddonationsystem.Enums.adminType;
import com.b7g2_08.blooddonationsystem.Models.Users.Admin;
import com.b7g2_08.blooddonationsystem.Models.Users.Donor;
import com.b7g2_08.blooddonationsystem.Models.Users.Hospital;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.b7g2_08.blooddonationsystem.Repos.AuthEntityRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.AdminUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.DonorUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HospitalUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HosterUserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AuthService {
    @Autowired
    AuthEntityRepository authRepo;
    @Autowired
    AdminUserRepository adminRepo;
    @Autowired
    DonorUserRepository donorRepo;
    @Autowired
    HospitalUserRepository hospitalRepo;
    @Autowired
    HosterUserRepository hosterRepo;
    @Autowired
    JwtUtil jwtUtil;
    @Autowired
    PasswordEncoder encoder;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    private static final Pattern NIC_PATTERN = Pattern.compile("^([0-9]{9}[vVxX]|[0-9]{12})$");

    @Transactional
    public TokenResponse login(authLoginDTO request) {
        TokenResponse token = new TokenResponse();

        //Verify user is in DB
        Optional<AuthEntity> opAuth = authRepo.findByUsername(request.getUsername());
        if (opAuth.isEmpty() ||
                !encoder.matches(request.getPassword(), opAuth.get().getPassword())) {

            token.setSuccess(false);
            token.setError("Invalid Username or Password");
        }
        else {
            int ID;

            token.setToken(jwtUtil.generateToken(opAuth.get().getUsername()));
            token.setSuccess(true);
            token.setRole(opAuth.get().getUserType().name());
            switch(opAuth.get().getUserType()) {
                case userType.ADMIN -> {
                    token.setAdminType(opAuth.get().getAdmin().getType());
                    ID = opAuth.get().getAdmin().getID();
                }
                case userType.DONOR -> ID = opAuth.get().getDonor().getID();
                case userType.HOSPITAL -> ID = opAuth.get().getHospital().getID();
                case userType.HOSTER -> ID = opAuth.get().getHoster().getID();
                default -> ID = 0;
            }
            token.setUserID(ID);
        }

        return token;
    }

    @Transactional
    public @ResponseBody String register_admin(adminCreateDTO _user) {
        checkPhoneNum(_user.getPhoneNum());
        checkEmail(_user.getEmail());
        checkUsername(_user.getUsername());

        Admin user = new Admin();
        AuthEntity auth = new AuthEntity();

        user.setPhoneNum(_user.getPhoneNum());
        user.setType(_user.getType());
        user.setAuthEntity(auth);

        auth.setUsername(_user.getUsername());
        auth.setPassword(encoder.encode(_user.getPassword()));
        auth.setEmail(_user.getEmail());
        auth.setUserType(userType.ADMIN);

        authRepo.save(auth);
        adminRepo.save(user);
        return "Registered";
    }

    @Transactional
    public @ResponseBody String register_donor(donorCreateDTO _user) {
        checkPhoneNum(_user.getPhoneNum());
        checkEmail(_user.getEmail());
        checkUsername(_user.getUsername());
        checkNIC(_user.getNic());
        checkBloodType(_user.getBloodType());

        Donor user = new Donor();
        AuthEntity auth = new AuthEntity();

        user.setF_Name(_user.getF_Name());
        user.setL_Name(_user.getL_Name());
        user.setNic(_user.getNic());
        user.setBloodType(_user.getBloodType());
        user.setDob(_user.getDob());
        user.setPhoneNum(_user.getPhoneNum());
        user.setAuthEntity(auth);

        auth.setUsername(_user.getUsername());
        auth.setPassword(encoder.encode(_user.getPassword()));
        auth.setEmail(_user.getEmail());
        auth.setUserType(userType.DONOR);

        authRepo.save(auth);
        donorRepo.save(user);
        return "Registered";
    }

    @Transactional
    public @ResponseBody String register_hospital(hospitalCreateDTO _user) {
        checkPhoneNum(_user.getPhoneNum());
        checkEmail(_user.getEmail());
        checkUsername(_user.getUsername());

        Hospital user = new Hospital();
        AuthEntity auth = new AuthEntity();

        user.setHospitalName(_user.getHospitalName());
        user.setAddress(_user.getAddress());
        user.setPhoneNum(_user.getPhoneNum());
        user.setAuthEntity(auth);

        auth.setUsername(_user.getUsername());
        auth.setPassword(encoder.encode(_user.getPassword()));
        auth.setEmail(_user.getEmail());
        auth.setUserType(userType.HOSPITAL);

        authRepo.save(auth);
        hospitalRepo.save(user);
        return "Registered";
    }

    @Transactional
    public @ResponseBody String register_hoster(hosterCreateDTO _user) {
        checkPhoneNum(_user.getPhoneNum());
        checkEmail(_user.getEmail());
        checkUsername(_user.getUsername());

        Hoster user = new Hoster();
        AuthEntity auth = new AuthEntity();

        user.setOrgName(_user.getOrgName());
        user.setPhoneNum(_user.getPhoneNum());
        user.setAuthEntity(auth);

        auth.setUsername(_user.getUsername());
        auth.setPassword(encoder.encode(_user.getPassword()));
        auth.setEmail(_user.getEmail());
        auth.setUserType(userType.HOSTER);

        authRepo.save(auth);
        hosterRepo.save(user);
        return "Registered";
    }

    @Transactional
    public @ResponseBody String edit_admin(adminUpdateDTO _user) {
        Admin user = adminRepo.findById(_user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found!"));
        AuthEntity auth = user.getAuthEntity();

        if (checkNullEmpty(_user.getPhoneNum())) {
            checkPhoneNum(_user.getPhoneNum());
            user.setPhoneNum(_user.getPhoneNum());
        }

        if (checkNullEmpty(_user.getUsername())) {
            checkUsername(_user.getUsername());
            auth.setUsername(_user.getUsername());
        }

        if (checkNullEmpty(_user.getPassword()))
            auth.setPassword(encoder.encode(_user.getPassword()));

        if (checkNullEmpty(_user.getEmail())) {
            checkEmail(_user.getEmail());
            auth.setEmail(_user.getEmail());
        }

        authRepo.save(auth);
        adminRepo.save(user);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String edit_donor(donorUpdateDTO _user) {
        Donor user = donorRepo.findById(_user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found!"));
        AuthEntity auth = user.getAuthEntity();

        if (checkNullEmpty(_user.getPhoneNum())) {
            checkPhoneNum(_user.getPhoneNum());
            user.setPhoneNum(_user.getPhoneNum());
        }

        if (checkNullEmpty(_user.getUsername())) {
            checkUsername(_user.getUsername());
            auth.setUsername(_user.getUsername());
        }

        if (checkNullEmpty(_user.getPassword()))
            auth.setPassword(encoder.encode(_user.getPassword()));

        if (checkNullEmpty(_user.getEmail())) {
            checkEmail(_user.getEmail());
            auth.setEmail(_user.getEmail());
        }

        if (checkNullEmpty(_user.getF_Name()))
            user.setF_Name(_user.getF_Name());
        if (checkNullEmpty(_user.getL_Name()))
            user.setL_Name(_user.getL_Name());
        if (checkNullEmpty(_user.getNic()))
            user.setNic(_user.getNic());
        if (checkNullEmpty(_user.getBloodType()))
            user.setBloodType(_user.getBloodType());
        // Guarded like every other field here: leaving dob out of the request used to null it, and
        // "!=" on LocalDate compares references, so an unchanged date still counted as a change.
        if (_user.getDob() != null && !_user.getDob().equals(user.getDob()))
            user.setDob(_user.getDob());
        if (checkNullEmpty(_user.getPhoneNum()))
            user.setPhoneNum(_user.getPhoneNum());

        authRepo.save(auth);
        donorRepo.save(user);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String edit_hospital(hospitalUpdateDTO _user) {
        Hospital user = hospitalRepo.findById(_user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found!"));
        AuthEntity auth = user.getAuthEntity();

        if (checkNullEmpty(_user.getPhoneNum())) {
            checkPhoneNum(_user.getPhoneNum());
            user.setPhoneNum(_user.getPhoneNum());
        }

        if (checkNullEmpty(_user.getUsername())) {
            checkUsername(_user.getUsername());
            auth.setUsername(_user.getUsername());
        }

        if (checkNullEmpty(_user.getPassword()))
            auth.setPassword(encoder.encode(_user.getPassword()));

        if (checkNullEmpty(_user.getEmail())) {
            checkEmail(_user.getEmail());
            auth.setEmail(_user.getEmail());
        }

        if (checkNullEmpty(_user.getHospitalName()))
            user.setHospitalName(_user.getHospitalName());
        if (checkNullEmpty(_user.getAddress()))
            user.setAddress(_user.getAddress());

        authRepo.save(auth);
        hospitalRepo.save(user);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String edit_hoster(hosterUpdateDTO _user) {
        Hoster user = hosterRepo.findById(_user.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found!"));
        AuthEntity auth = user.getAuthEntity();

        if (checkNullEmpty(_user.getPhoneNum())) {
            checkPhoneNum(_user.getPhoneNum());
            user.setPhoneNum(_user.getPhoneNum());
        }

        if (checkNullEmpty(_user.getUsername())) {
            checkUsername(_user.getUsername());
            auth.setUsername(_user.getUsername());
        }

        if (checkNullEmpty(_user.getPassword()))
            auth.setPassword(encoder.encode(_user.getPassword()));

        if (checkNullEmpty(_user.getEmail())) {
            checkEmail(_user.getEmail());
            auth.setEmail(_user.getEmail());
        }

        if (checkNullEmpty(_user.getOrgName()))
            user.setOrgName(_user.getOrgName());

        authRepo.save(auth);
        hosterRepo.save(user);
        return "Updated";
    }

    public Iterable<Admin> getAdmins() {
        return adminRepo.findAll();
    }
    public Iterable<Hospital> getHospitals() {
        return hospitalRepo.findAll();
    }
    public Iterable<Donor> getDonors() {
        return donorRepo.findAll();
    }
    public Iterable<Hoster> getHosters() {
        return hosterRepo.findAll();
    }

    @Transactional
    public @ResponseBody String deleteMe(AuthEntity me) {
        authRepo.deleteById(me.getId());
        return "Deleted";
    }

    @Transactional
    public @ResponseBody String deleteUser (userType type, int ID) {
        // Sysadmins are the only accounts that can manage other admins, so deleting one can lock
        // everybody out of administration. Demote the account first if it really has to go.
        if (type == userType.ADMIN) {
            Admin admin = adminRepo.findById(ID)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User Not Found!"));
            if (admin.getType() == adminType.SYSADMIN)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sysadmin accounts cannot be deleted.");
        }

        UserContext context = setupContext(type);
        if (context != null)
            return context.delete(ID);
        else
            return "Invalid user type provided!";
    }

    public @ResponseBody User getUser (userType type, int ID) {
        UserContext context = setupContext(type);
        if (context != null)
            return context.getUser(ID);
        else
            return null;
    }

    private UserContext setupContext(userType type) {
        UserContext context = new UserContext();
        switch(type) {
            case userType.ADMIN -> context.setStrategy(new AdminStrategy(adminRepo,authRepo));
            case userType.DONOR -> context.setStrategy(new DonorStrategy(donorRepo,authRepo));
            case userType.HOSPITAL -> context.setStrategy(new HospitalStrategy(hospitalRepo,authRepo));
            case userType.HOSTER -> context.setStrategy(new HosterStrategy(hosterRepo,authRepo));
            default -> {return null;}
        }
        return context;
    }

    //VERIFICATION FUNCTIONS//

    private void checkPhoneNum(String phoneNum) {
        if (phoneNum == null || !phoneNum.matches("\\d{10}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number must be exactly 10 digits");
        }
    }

    private void checkUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (authRepo.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
    }

    private void checkEmail(String email) {
        Matcher matcher = EMAIL_PATTERN.matcher(email);
        if (!matcher.matches())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Email Address");
    }

    private void checkNIC(String NIC) {
        if (NIC != null) {
            Matcher matcher = NIC_PATTERN.matcher(NIC);
            if (!matcher.matches())
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid NIC Number");
        }
        else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid NIC Number");
        }
    }

    private void checkBloodType(String bloodType) {
        if (!bloodTypeList.list.contains(bloodType))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Blood Type");
    }

    private boolean checkNullEmpty(String string) {
        return (string != null && !string.isEmpty());
    }
}
