//
//  WaterMarkView.swift
//  RedPepper
//
//  Created by An Phan on 11/01/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class WaterMarkView: UIView {

    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var descLabel: UILabel!
    @IBOutlet weak var imageTopConstraint: NSLayoutConstraint!
    @IBOutlet weak var descLabelTopConstraint: NSLayoutConstraint!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        
        if DeviceType.iphone5 {
            descLabelTopConstraint?.constant -= 45.0
            imageTopConstraint?.constant -= 20.0
            descLabel.font = UIFont.raleWaySemiBold(size: 24)
        }
    }
    func setWaterMarkImage(imageName: String, text: String) {
        imageView.image = UIImage(named: imageName)
        descLabel.text = text
    }
    /*
    // Only override drawRect: if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func drawRect(rect: CGRect) {
        // Drawing code
    }
    */

}
