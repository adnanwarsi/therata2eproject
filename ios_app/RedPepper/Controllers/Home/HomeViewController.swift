//
//  HomeViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/9/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import TSMessages

class HomeViewController: BaseViewController {

    // MARK: - IBOutlets
    @IBOutlet weak var tableView: UITableView!
    
    // MARK: - fileprivate properties
    fileprivate var recipes = DataManager.sharedInstance.recipes
    fileprivate var waterMarkView: WaterMarkView!
    
    // MARK: - View lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()

        // Watermark
        waterMarkView = WaterMarkView.fromNib()
        
        // Do any additional setup after loading the view.
        tableView.register(UINib(nibName: "RecipeTableViewCell", bundle: nil), forCellReuseIdentifier: "RecipeTableViewCell")
        
        if !isAppAlreadyLaunchedOnce() {
            let walkThroughVC = Storyboard.storyboard.instantiateViewController(withIdentifier: Storyboard.Identifiers.walkThroughNavController)
            present(walkThroughVC, animated: false, completion: nil)
        }
        
        if recipes.count == 0 {
            showLoading()
        }
        RecipeService.sharedInstance.getRecipesWithCompletionHandler { (response, error) in
            self.hideLoading()
            if let response = response {
                self.recipes = response.recipes
                if self.recipes.count == 0 {
                    self.tableView.backgroundView = self.waterMarkView
                }
                self.tableView.reloadData()
            }
            else {
                self.tableView.backgroundView = self.waterMarkView
            }
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // MARK: - IBActions
    @IBAction func menuButtonTapped(_ sender: UIBarButtonItem) {
        
        // Dimiss keyboard (optional)
        view.endEditing(true)
        frostedViewController.view.endEditing(true)
        
        // Present the view contoller
        frostedViewController.presentMenuViewController()
    }

    @IBAction func addButtonTapped(_ sender: UIButton) {
        let storyboardID = Storyboard.Identifiers.createRecipeNavController
        self.frostedViewController.contentViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID)
        
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: Notifications.reloadMenuNotification), object: 1)
    }
    
    // MARK: - Private methods
    fileprivate func isAppAlreadyLaunchedOnce() -> Bool {
        let defaults = UserDefaults.standard
        if let _ = defaults.string(forKey: "isAppAlreadyLaunchedOnce"){
            print("App already launched")
            return true
        }
        else{
            defaults.set(true, forKey: "isAppAlreadyLaunchedOnce")
            print("App launched first time")
            return false
        }
    }
}

// MARK: - UITableViewDataSource

extension HomeViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return recipes.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "RecipeTableViewCell", for: indexPath) as! RecipeTableViewCell
        cell.renderRecipeInfo(recipe: recipes[indexPath.row])
        if !recipes[indexPath.row].url.isEmpty {
            cell.clickOnTrashButton = { button in
                let confirmAlert = UIAlertController(title: "Are you sure you want to delete this recipe?", message: nil, preferredStyle: .alert)
                
                let yesAction = UIAlertAction(title: "Yes", style: .destructive) { (alertAction) -> Void in
                    self.showLoading()
                    RecipeService.sharedInstance.deleteRecipeWithUrl(recipeUrl: self.recipes[indexPath.row].url,
                                                                     completionHandler: { (recipeResponse, error) in
                    self.hideLoading()
                    if let response = recipeResponse {
                        debugPrint(response)
                        TSMessage.showNotification(in: self, title: "Recipe removed", subtitle: nil, type: .success, duration: 2.0)
                        
                        // Update the list
                        self.recipes = DataManager.sharedInstance.recipes
                        CATransaction.begin()
                        CATransaction.setCompletionBlock({
                            tableView.reloadData()
                        })
                        tableView.beginUpdates()
                        tableView.deleteRows(at: [indexPath], with: .automatic)
                        tableView.endUpdates()
                        
                        CATransaction.commit()
                        if self.recipes.count == 0 {
                            self.tableView.backgroundView = self.waterMarkView
                        }
                    }
                    else {
                        TSMessage.showNotification(in: self, title: "Can't remove recipe", subtitle: nil, type: .error, duration: 2.0)
                    }
                    })
                }
                
                let noAction = UIAlertAction(title: "No", style: .cancel) { (alertAction) -> Void in
                    // Do nothing
                }
                
                confirmAlert.addAction(yesAction)
                confirmAlert.addAction(noAction)
                
                let topVC = UIApplication.topViewController()
                topVC!.present(confirmAlert, animated: true, completion: nil)
            }
            cell.clickOnTopButton = { button in
                self.showLoading()
                RecipeService.sharedInstance.makeTopRecipeWithUrl(recipeUrl: self.recipes[indexPath.row].url, completionHandler: { (recipeResponse, error) in
                    self.hideLoading()
                    if let response = recipeResponse {
                        debugPrint(response)
                        self.recipes = DataManager.sharedInstance.recipes
                        
                        CATransaction.begin()
                        CATransaction.setCompletionBlock({
                            tableView.reloadData()
                        })
                        tableView.beginUpdates()
                        tableView.moveRow(at: indexPath, to: IndexPath(row: 0, section: 0))
                        tableView.endUpdates()
                        
                        CATransaction.commit()
                    }
                    else {
                        TSMessage.showNotification(in: self,
                                                   title: "Can't move recipe",
                                                   subtitle: nil,
                                                   type: .error,
                                                   duration: 2.0)
                    }
                })
            }
        }
        
        return cell
    }
}

// MARK: - UITableViewDelegate

extension HomeViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let url = recipes[indexPath.row].url
        if !url.isEmpty {
            let storyboardID = Storyboard.Identifiers.faqViewController
            let recipeDetailVC = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID) as! WebViewController
            recipeDetailVC.loadUrl = url
            recipeDetailVC.isRecipeDetail = true
            recipeDetailVC.title = recipes[indexPath.row].name
            navigationController?.pushViewController(recipeDetailVC, animated: true)
        }
    }
}
