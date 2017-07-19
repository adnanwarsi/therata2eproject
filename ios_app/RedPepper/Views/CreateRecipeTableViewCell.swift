//
//  CreateRecipeTableViewCell.swift
//  RedPepper
//
//  Created by An Phan on 10/21/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit

class CreateRecipeTableViewCell: UITableViewCell {

    // MARK: - IBOutlets
    @IBOutlet weak var textField: UITextField!

    var didChangedValue: ((String) -> Void)?
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

    @IBAction func textFieldChangedValue(_ sender: UITextField) {
        didChangedValue?(sender.text ?? "")
    }
}
