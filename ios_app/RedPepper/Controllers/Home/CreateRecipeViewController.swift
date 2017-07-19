//
//  CreateRecipeViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/11/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import TSMessages
import MobilePlayer

class CreateRecipeViewController: BaseViewController {

    var rows = [""]
    var recipeUrl = ""
    var playerVC: MobilePlayerViewController?
    @IBOutlet weak var placeholderView: UIView!
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var placeholderImageView: UIImageView!
    @IBOutlet weak var bgMovieView: UIView!
    @IBOutlet weak var compatibleLabel: UILabel!
    
    // MARK: - View life cycle
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        let clickHere = NSMutableAttributedString(string: compatibleLabel.text!)
        let clickHereRange: NSRange = (compatibleLabel.text! as NSString).range(of: "click here")
        clickHere.addAttribute(NSFontAttributeName, value: UIFont.raleWayBold(size: 15), range:clickHereRange)
        clickHere.addAttribute(NSUnderlineStyleAttributeName, value: 1, range:clickHereRange)
        compatibleLabel.attributedText = clickHere
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        placeholderView.addBorderWithColor(UIColor.mainColor(), width: 1.0)
        placeholderImageView.kf.indicatorType = .activity
        placeholderImageView.kf.setImage(with: URL(string: AppConfig.ExternalURLs.addRecipeImage), placeholder: nil,
                                         options: nil, progressBlock: nil) { (image, error, type, url) in
                                            self.playButton.isHidden = false
        }
        
        if let url = NSURL(string: AppConfig.ExternalURLs.addRecipeVideo) {
            playerVC = MobilePlayerViewController(contentURL: url as URL)
            if let closeButton = playerVC?.getViewForElementWithIdentifier("close") {
                closeButton.isHidden = true
            }
            playerVC?.view.frame = CGRect(x: 0, y: 0,
                                         width: bgMovieView.frame.size.width,
                                         height: bgMovieView.frame.size.height)
            playerVC?.shouldAutoplay = false
            bgMovieView.addSubview(playerVC!.view)
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        playerVC?.stop()
        playerVC = nil
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func playButtonTapped(_ sender: UIButton) {
        bgMovieView.isHidden = false
        placeholderView.isHidden = true
        playerVC?.play()
    }
    
    @IBAction func menuButtonTapped(_ sender: UIBarButtonItem) {
        
        // Dimiss keyboard (optional)
        view.endEditing(true)
        frostedViewController.view.endEditing(true)
        
        // Present the view contoller
        frostedViewController.presentMenuViewController()
    }
    
    @IBAction func submitButtonTapped(_ sender: UIButton) {
        guard !recipeUrl.isEmpty else {
            TSMessage.showNotification(in: self, title: "Please enter a recipe url", subtitle: nil, type: .error, duration: 2.0)
            return
        }
        
        showLoading()
        view.endEditing(true)
        RecipeService.sharedInstance.addRecipeWithUrl(recipeUrl: recipeUrl) { (recipeResponse, error) in
            self.hideLoading()
            if let response = recipeResponse {
                debugPrint(response)
                TSMessage.showNotification(in: self, title: "Create recipe successfully", subtitle: nil, type: .success, duration: 2.0)
                self.perform(#selector(self.setHome), with: self, afterDelay: 2.0)
            }
            else {
                self.view.endEditing(false)
                TSMessage.showNotification(in: self, title: "Can't create new recipe", subtitle: nil, type: .error, duration: 2.0)
            }
        }
    }
    
    @IBAction func clickHereButtonTapped(_ sender: UIButton) {
        let storyboardID = Storyboard.Identifiers.faqViewController
        let compatibleVC = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID) as! WebViewController
        compatibleVC.loadUrl = AppConfig.ExternalURLs.compatibleApps
        compatibleVC.title = "Alpha Pepper"
        compatibleVC.isPushed = true
        navigationController?.pushViewController(compatibleVC, animated: true)
    }
    
    // MARK: - Helper methods
    
    func setHome() {
        let storyboardID = Storyboard.Identifiers.homeNavigationController
        self.frostedViewController.contentViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID)
        
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: Notifications.reloadMenuNotification), object: 0)
    }
}

// MARK: - UITableViewDataSource

extension CreateRecipeViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return rows.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
//        let cellID = indexPath.row == rows.count - 1 ? "addMoreRecipeCellID" : "addRecipeCellID"
        let cell = tableView.dequeueReusableCell(withIdentifier: "addRecipeCellID", for: indexPath) as! CreateRecipeTableViewCell
        cell.didChangedValue = { text in
            self.recipeUrl = text
        }
        
        return cell
    }
}

extension CreateRecipeViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        rows.append("")
        let insertedIndexPath = IndexPath(row: rows.count - 2, section: 0)
        tableView.insertRows(at: [insertedIndexPath], with: .top)
    }
}
