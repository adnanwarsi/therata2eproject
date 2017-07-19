//
//  TutorialViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/11/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import MobilePlayer

class TutorialViewController: BaseViewController {

    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var movieBgView: UIView!
    @IBOutlet weak var placeholderView: UIView!
    @IBOutlet weak var placeholderImageView: UIImageView!
    @IBOutlet weak var movie2BgView: UIView!
    @IBOutlet weak var placeholder2View: UIView!
    @IBOutlet weak var placeholder2ImageView: UIImageView!
    @IBOutlet weak var play2Button: UIButton!
    @IBOutlet weak var moreInfolabel: UILabel!
    
    var playerVC1: MobilePlayerViewController?
    var playerVC2: MobilePlayerViewController?
    
    // MARK: - View life cycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let clickHere = NSMutableAttributedString(string: moreInfolabel.text!)
        let clickHereRange: NSRange = (moreInfolabel.text! as NSString).range(of: "click here")
        clickHere.addAttribute(NSFontAttributeName, value: UIFont.raleWayBold(size: 17), range:clickHereRange)
        clickHere.addAttribute(NSUnderlineStyleAttributeName, value: 1, range:clickHereRange)
        moreInfolabel.attributedText = clickHere
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        placeholderView.addBorderWithColor(UIColor.mainColor(), width: 1.0)
        placeholderImageView.kf.indicatorType = .activity
        placeholderImageView.kf.setImage(with: URL(string: AppConfig.ExternalURLs.signOnImage), placeholder: nil,
                                         options: nil, progressBlock: nil) { (image, error, type, url) in
                                            self.playButton.isHidden = false
        }
        
        // Play the tutorial page
        if let url = NSURL(string: AppConfig.ExternalURLs.signOnVideo) {
            playerVC1 = MobilePlayerViewController(contentURL: url as URL)
            if let closeButton = playerVC1?.getViewForElementWithIdentifier("close") {
                closeButton.isHidden = true
            }
            playerVC1?.view.frame = CGRect(x: 0, y: 0,
                                           width: movieBgView.frame.size.width,
                                           height: movieBgView.frame.size.height)
            playerVC1?.shouldAutoplay = false
            movieBgView.addSubview(playerVC1!.view)
        }
        
        placeholder2View.addBorderWithColor(UIColor.mainColor(), width: 1.0)
        placeholder2ImageView.kf.indicatorType = .activity
        placeholder2ImageView.kf.setImage(with: URL(string: AppConfig.ExternalURLs.tutorialImage), placeholder: nil,
                                         options: nil, progressBlock: nil) { (image, error, type, url) in
            self.play2Button.isHidden = false
        }
        
        // Play the tutorial page
        if let url = NSURL(string: AppConfig.ExternalURLs.tutorialVideo) {
            playerVC2 = MobilePlayerViewController(contentURL: url as URL)
            if let closeButton = playerVC2?.getViewForElementWithIdentifier("close") {
                closeButton.isHidden = true
            }
            playerVC2?.view.frame = CGRect(x: 0, y: 0,
                                           width: movie2BgView.frame.size.width,
                                           height: movie2BgView.frame.size.height)
            playerVC2?.shouldAutoplay = false
            movie2BgView.addSubview(playerVC2!.view)
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        playerVC1?.stop()
        playerVC1 = nil
        playerVC2?.stop()
        playerVC2 = nil
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
    
    @IBAction func playButtonTapped(_ sender: UIButton) {
        movieBgView.isHidden = false
        placeholderView.isHidden = true
        playerVC1?.play()
    }
    
    @IBAction func moreInfoButtonTapped(_ sender: UIButton) {
        let storyboardID = Storyboard.Identifiers.faqViewController
        let turotialVC = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID) as! WebViewController
        turotialVC.loadUrl = AppConfig.ExternalURLs.tutorialPage
        turotialVC.isPushed = true
        turotialVC.title = "Tutotial"
        navigationController?.pushViewController(turotialVC, animated: true)
    }
    
    @IBAction func play2ButtonTapped(_ sender: UIButton) {
        movie2BgView.isHidden = false
        placeholder2View.isHidden = true
        playerVC2?.play()
    }
}
