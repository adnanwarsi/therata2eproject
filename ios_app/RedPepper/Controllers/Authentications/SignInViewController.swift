//
//  SignInViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/9/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import FBSDKLoginKit

class SignInViewController: BaseViewController {

    @IBOutlet weak var signUpLabel: UILabel!
    
    @IBOutlet weak var emailTextField: UITextField!
    @IBOutlet weak var pwdTextField: UITextField!
    @IBOutlet weak var signInButton: UIButton!
    @IBOutlet weak var signInFBButton: UIButton!
    @IBOutlet weak var signInGoogleButton: UIButton!
    @IBOutlet weak var signUpButton: UIButton!
    @IBOutlet weak var logoImageView: UIImageView!
    @IBOutlet weak var logoTopConstraint: NSLayoutConstraint!
    
    var dict : [String : AnyObject]!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        let signUp = NSMutableAttributedString(string: signUpLabel.text!)
        let signUpRange: NSRange = (signUpLabel.text! as NSString).range(of: "Sign Up")
        signUp.addAttribute(NSFontAttributeName,
                            value: UIFont.raleWayRegular(size: 13),
                            range:signUpRange)
        signUpLabel.attributedText = signUp
        signInFBButton.layer.cornerRadius = 5.0
        
        if DeviceType.iphone5 {
            logoTopConstraint.constant = 25.0
            logoImageView.transform = CGAffineTransform( scaleX: 0.7 , y: 0.7)
        }
        
        prepareNavigationBar()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // MARK: - Helper methods
    fileprivate func prepareNavigationBar() {
        navigationController?.navigationBar.isTranslucent = true
        navigationController?.navigationBar.setBackgroundImage(UIImage(), for: .default)
        navigationController?.navigationBar.shadowImage = UIImage()
        navigationController?.navigationBar.tintColor = UIColor.white
        navigationController?.navigationBar.topItem?.title = ""
    }
    
    // MARK: - Navigation
    
    @IBAction func signInButtonTapped(_ sender: UIButton) {
//        AppState.setHome()
    }
    
    @IBAction func signInFBButtonTapped(_ sender: UIButton) {
        let fbLoginManager : FBSDKLoginManager = FBSDKLoginManager()
        fbLoginManager.logIn(withReadPermissions: ["email"], from: self) { (result, error) in
            if (error == nil){
                let fbloginresult : FBSDKLoginManagerLoginResult = result!
                if fbloginresult.grantedPermissions != nil {
                    if(fbloginresult.grantedPermissions.contains("email")) {
                        self.getFBUserData()
                    }
                }
            }
        }
    }
    
    @IBAction func signInGGButtonTapped(_ sender: UIButton) {
//        AppState.setHome()
    }
    
    @IBAction func signUpButtonTapped(_ sender: UIButton) {
    }
    
    // MARK: - Facebook login integration
    
    func getFBUserData(){
        if((FBSDKAccessToken.current()) != nil) {
            
            // Make request to get Facebook user info
            showLoading()
            FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name, first_name, last_name, picture.type(large), email"]).start(completionHandler: { (connection, result, error) -> Void in
                if (error == nil){
                    self.dict = result as! [String : AnyObject]
                    print(self.dict)
                    
                    // Save facebook user token
                    AppState.UserAuth.authToken = FBSDKAccessToken.current().tokenString
                    AppState.UserAuth.lastUserName = self.dict["name"] as? String
                    if let fbUserId = self.dict["id"] {
                        AppState.UserAuth.lastUserId = String(describing: fbUserId)
                    }
                    
                    // Make request to get user info
                    UserService.sharedInstance.getUserWithCompletionHandler(completionHandler: { (userResponse, error) in
                        self.hideLoading()
                        if let _ = error {
                            
                            // Handle error message
                            let okAction = UIAlertAction(title: "Ok", style: .default, handler: { (alertAction) in
                                if let url = URL(string: AppConfig.ExternalURLs.alexaSetupGuide) {
                                    UIApplication.shared.openURL(url)
                                }
                            })
                            self.showAlertWithActions(Messages.appName,
                                                      message: "Add the Red-Pepper skill on Echo and initiate it there first",
                                                      actions: [okAction])
                        }
                        else {
                            AppState.setHome()
                        }
                    })
                }
                else {
                    self.hideLoading()
                }
            })
        }
    }
}
