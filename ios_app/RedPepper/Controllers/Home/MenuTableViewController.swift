//
//  MenuTableViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/10/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import FBSDKLoginKit

class MenuTableViewController: UITableViewController {
    
    let menuItems = ["Home", "Add more recipes", "Tutorial", "Give us feedback", "Frequently asked questions", "My account (please update details)", "Logout"]
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
        clearsSelectionOnViewWillAppear = false
        
        // Select default first row
        let firstIndexPath = IndexPath(row: 0, section: 0)
        tableView.selectRow(at: firstIndexPath, animated: false, scrollPosition: .top)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(reloadMenu),
                                               name: NSNotification.Name(rawValue: Notifications.reloadMenuNotification),
                                               object: nil)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func reloadMenu(notification: Notification) {
        if let row = notification.object as? Int {
            let firstIndexPath = IndexPath(row: row, section: 0)
            tableView.selectRow(at: firstIndexPath, animated: false, scrollPosition: .top)
        }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // MARK: - Table view data source
    
    @IBAction func closeButtonTapped(_ sender: UIButton) {
        frostedViewController.hideMenuViewController()
    } 
    
    // MARK: - Table view data source

    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return menuItems.count
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: MenuTableViewCell.menuCellID, for: indexPath) as! MenuTableViewCell
        cell.itemNameLabel.text = menuItems[indexPath.row]

        // Configure the cell...

        return cell
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        var storyboardID = Storyboard.Identifiers.homeNavigationController
        switch indexPath.row {
        case 0:
            storyboardID = Storyboard.Identifiers.homeNavigationController
        case 1:
            storyboardID = Storyboard.Identifiers.createRecipeNavController
        case 2:
            storyboardID = Storyboard.Identifiers.tutorialNavController
        case 3:
            storyboardID = Storyboard.Identifiers.feedbackNavController
        case 4:
            storyboardID = Storyboard.Identifiers.faqNavController
        case 5:
            storyboardID = Storyboard.Identifiers.accountNavController
        case 6:
            showSignOutAlert()
        default:
            break
        }
        
        frostedViewController.contentViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID)
        frostedViewController.hideMenuViewController()
    }
    
    // MARK: - Private methods
    
    fileprivate func showSignOutAlert() {
        let actionSheet = UIAlertController(title: "Are you sure you want to sign out?",
                                            message: nil,
                                            preferredStyle: .actionSheet)
        
        let logOutAction = UIAlertAction(title: "Sign out", style: .destructive) { (alertAction) -> Void in
            DataManager.sharedInstance.logoutUser()
            AppState.clearSessionUser()
            AppState.setSignIn()
            FBSDKLoginManager().logOut()
        }
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel) { (alertAction) -> Void in
            // Do nothing
        }
        
        actionSheet.addAction(logOutAction)
        actionSheet.addAction(cancelAction)
        
        let topVC = UIApplication.topViewController()
        topVC?.present(actionSheet, animated: true, completion: nil)
    }
}
