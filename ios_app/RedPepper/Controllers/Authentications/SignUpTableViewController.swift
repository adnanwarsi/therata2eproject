//
//  signInTableViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/9/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class SignUpTableViewController: UITableViewController {
    
    @IBOutlet weak var signInLabel: UILabel!
    @IBOutlet weak var avatarImageView: UIImageView!
    @IBOutlet weak var usernameLabel: UITextField!
    @IBOutlet weak var ageTextField: UITextField!
    @IBOutlet weak var genderTextField: UITextField!
    @IBOutlet weak var houseSizeTextField: UITextField!
    @IBOutlet weak var empStatusTextField: UITextField!
    @IBOutlet weak var cookingSkillTextField: UITextField!
    
    var imagePickerController = UIImagePickerController()
    var selectedImage: UIImage?
    
    // Five pickers
    var agePicker: PickerView = PickerView.fromNib()
    var genderPicker: PickerView = PickerView.fromNib()
    var houseSizePicker: PickerView = PickerView.fromNib()
    var empStatusPicker: PickerView = PickerView.fromNib()
    var skillPicker: PickerView = PickerView.fromNib()
    
    // MARK: - View life cycle
    
    override func viewDidLoad() {
        super.viewDidLoad()

        avatarImageView.addGestureRecognizer(UITapGestureRecognizer(target: self, action: #selector(browserImage)))

        let signIn = NSMutableAttributedString(string: signInLabel.text!)
        let signInRange: NSRange = (signInLabel.text! as NSString).range(of: "Sign In")
        signIn.addAttribute(NSForegroundColorAttributeName, value: UIColor.rgbColor(red: 29, green: 29, blue: 38), range:signInRange)
        signInLabel.attributedText = signIn
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        preparePicker()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // MARK: - Private methods
    
    fileprivate func preparePicker() {
        
        // Age picker
        ageTextField.inputView = agePicker
        agePicker.textField = ageTextField
        agePicker.titleLabel.text = "Age"
        agePicker.values = ["", ""]
        var ages = [String]()
        for index in 10...99 {
            ages.append(String(index))
        }
        agePicker.values = ages
        agePicker.didSelectedValue = { selectedValue in
            self.ageTextField.text = selectedValue
        }
        
        // Gender picker
        genderTextField.inputView = genderPicker
        genderPicker.textField = genderTextField
        genderPicker.titleLabel.text = "Gender"
        genderPicker.values = ["Male", "Female"]
        genderPicker.didSelectedValue = { selectedValue in
            self.genderTextField.text = selectedValue
        }
        
        // Household size picker
        houseSizeTextField.inputView = houseSizePicker
        houseSizePicker.textField = houseSizeTextField
        houseSizePicker.titleLabel.text = "Household Size"
        var houseHoldSizes = [String]()
        for index in 1...10 {
            houseHoldSizes.append(String(index))
        }
        houseSizePicker.values = houseHoldSizes
        houseSizePicker.didSelectedValue = { selectedValue in
            self.houseSizeTextField.text = selectedValue
        }
        
        // Profession picker
        empStatusTextField.inputView = empStatusPicker
        empStatusPicker.textField = empStatusTextField
        empStatusPicker.titleLabel.text = "Profession"
        empStatusPicker.values = ["Home maker", "Business owner", "Employed"]
        empStatusPicker.didSelectedValue = { selectedValue in
            self.empStatusTextField.text = selectedValue
        }
        
        // Cooking skill picker
        cookingSkillTextField.inputView = skillPicker
        skillPicker.textField = cookingSkillTextField
        skillPicker.titleLabel.text = "Cooking Skills"
        skillPicker.values = ["Beginner", "Expert", "Master"]
        skillPicker.didSelectedValue = { selectedValue in
            self.cookingSkillTextField.text = selectedValue
        }
    }
    
    // MARK: - IBActions
    
    @IBAction func signUpButtonTapped(_ sender: UIButton) {
        AppState.setHome()
    }
    
    @IBAction func signInButtonTapped(_ sender: UIButton) {
        _ = navigationController?.popViewController(animated: true)
    }

    // MARK: - Methods
    
    func browserImage() {
        let actionSheet:UIAlertController = UIAlertController(title:Messages.cameraTitle,
                                                              message:Messages.cameraDescription, preferredStyle:.actionSheet)
        
        let cancelAction = UIAlertAction(title:Messages.alertCancel, style:.cancel, handler: {
            action -> Void in
        })
        actionSheet.addAction(cancelAction)
        
        let photoAction = UIAlertAction(title:Messages.cameraTakePhoto, style:.default, handler: {
            action -> Void in
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                self.imagePickerController.sourceType    = .camera
                self.imagePickerController.allowsEditing = true
                self.present(self.imagePickerController, animated: true, completion: nil)
            }
        })
        actionSheet.addAction(photoAction)
        
        let cameraRollAction = UIAlertAction(title:Messages.cameraRoll, style:.default, handler:{
            action -> Void in
            self.imagePickerController.sourceType    = .photoLibrary
            self.imagePickerController.allowsEditing = true
            self.present(self.imagePickerController, animated: true, completion: nil)
        })
        actionSheet.addAction(cameraRollAction)
        imagePickerController.delegate = self
        present(actionSheet, animated: true, completion:nil)
    }
    
    // MARK: - UITableViewDataSource
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        switch indexPath.row {
        case 0:
            ageTextField.becomeFirstResponder()
        case 1:
            genderTextField.becomeFirstResponder()
        case 2:
            houseSizeTextField.becomeFirstResponder()
        case 3:
            empStatusTextField.becomeFirstResponder()
        case 4:
            cookingSkillTextField.becomeFirstResponder()
        default:
            break
        }
    }
}

// MARK: - UIImagePickerControllerDelegate

extension SignUpTableViewController: UIImagePickerControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        selectedImage = info[UIImagePickerControllerEditedImage] as? UIImage
        avatarImageView.roundify()
        avatarImageView.image = selectedImage
        
        // Dismiss photo or camera view
        dismiss(animated: true, completion: nil)
    }
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        imagePickerController.dismiss(animated: true, completion: nil)
    }
}

// MARK: - UINavigationControllerDelegate

extension SignUpTableViewController: UINavigationControllerDelegate {
    func navigationController(_ navigationController: UINavigationController, willShow viewController: UIViewController, animated: Bool) {
        // Navigation bar style
        navigationController.navigationBar.tintColor = UIColor.white
        navigationController.navigationBar.barTintColor = UIColor.mainColor()
        navigationController.navigationBar.isTranslucent = false
        navigationController.navigationBar.titleTextAttributes = [NSForegroundColorAttributeName: UIColor.white]
    }
}
