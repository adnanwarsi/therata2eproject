//
//  WalkThroughViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/14/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import MobilePlayer
import Kingfisher

class WalkThroughViewController: BaseViewController {

    @IBOutlet weak var movieBgView: UIView!
    @IBOutlet weak var smallPlayButton: UIButton!
    @IBOutlet weak var playButton: UIButton!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var placeholderView: UIView!
    @IBOutlet weak var placeholderImageView: UIImageView!
    
    var playerVC: MobilePlayerViewController?
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        placeholderImageView.kf.indicatorType = .activity
        placeholderImageView.kf.setImage(with: URL(string: AppConfig.ExternalURLs.signOnImage), placeholder: nil,
                                         options: nil, progressBlock: nil) { (image, error, type, url) in
                                            self.playButton.isHidden = false
        }
        
        // Play the tutorial page
        if let url = NSURL(string: AppConfig.ExternalURLs.signOnVideo) {
            playerVC = MobilePlayerViewController(contentURL: url as URL)
            if let closeButton = playerVC?.getViewForElementWithIdentifier("close") {
                closeButton.isHidden = true
            }
            playerVC?.view.frame = CGRect(x: 0, y: 0,
                                         width: movieBgView.frame.size.width,
                                         height: movieBgView.frame.size.height)
            playerVC?.shouldAutoplay = false
            movieBgView.addSubview(playerVC!.view)
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
    
    // MARK: - IBActions
    
    @IBAction func skipButtonTapped(_ sender: UIButton) {
        dismiss(animated: true, completion: nil)
    }
    
    @IBAction func playButtonTapped(_ sender: UIButton) {
        placeholderView.isHidden = true
        movieBgView.isHidden = false
        playerVC?.play()
    }
}
