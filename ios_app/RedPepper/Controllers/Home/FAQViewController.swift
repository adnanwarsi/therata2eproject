//
//  FAQViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/11/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class FAQViewController: BaseViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
