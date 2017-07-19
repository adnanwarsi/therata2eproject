//
//  RootViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/10/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import REFrostedViewController

class RootViewController: REFrostedViewController {

    override func awakeFromNib() {
        contentViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: Storyboard.Identifiers.homeNavigationController)
        menuViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: Storyboard.Identifiers.menuViewController)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
