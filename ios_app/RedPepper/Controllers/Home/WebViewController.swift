//
//  WebViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/13/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class WebViewController: BaseViewController {

    @IBOutlet weak var webView: UIWebView!
    
    var isPresenting = false
    var isPushed = false
    var isRecipeDetail = false
    var loadUrl = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        if isPresenting || isRecipeDetail || isPushed {
            navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "back-bar"),
                                                               style: .plain,
                                                               target: self,
                                                               action: #selector(back))
        }
        else {
            loadUrl = loadUrl.isEmpty ? AppConfig.ExternalURLs.faq : loadUrl
        }
     
        if let url = URL(string: loadUrl) {
            webView.loadRequest(URLRequest(url: url))
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func back() {
        if isRecipeDetail || isPushed {
            _ = navigationController?.popViewController(animated: true)
        }
        else {
            dismiss(animated: true, completion: nil)
        }
    }
    
    @IBAction func menuButtonTapped(_ sender: UIBarButtonItem) {
        
        // Dimiss keyboard (optional)
        view.endEditing(true)
        frostedViewController.view.endEditing(true)
        
        // Present the view contoller
        frostedViewController.presentMenuViewController()
    }
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
