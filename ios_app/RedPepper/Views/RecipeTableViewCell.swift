//
//  RecipeTableViewCell.swift
//  RedPepper
//
//  Created by An Phan on 10/9/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import Kingfisher

class RecipeTableViewCell: UITableViewCell {

    @IBOutlet weak var recipeImageView: UIImageView!
    @IBOutlet weak var recipeNameLabel: UILabel!
    @IBOutlet weak var recipeDescLabel: UILabel!
    @IBOutlet weak var microButton: UIButton!
    
    var clickOnTrashButton: ((UIButton) -> Void)?
    var clickOnTopButton: ((UIButton) -> Void)?
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
    @IBAction func microButtonTapped(_ sender: UIButton) {
        clickOnTopButton?(sender)
    }
    
    @IBAction func trashButtonTapped(_ sender: UIButton) {
        clickOnTrashButton?(sender)
    }
    
    func renderRecipeInfo(recipe: Recipe) {
        recipeNameLabel.text = recipe.name
        recipeDescLabel.text = recipe.source
        if let imageURL = URL(string: recipe.image) {
            recipeImageView.kf.indicatorType = .activity
            recipeImageView.kf.setImage(with: imageURL)
        }
        else {
            recipeImageView.kf.setImage(with: URL(string: AppConfig.ExternalURLs.placeHolderImage))
        }
    }
}
