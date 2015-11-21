/**
 * Created by Lionel on 20/11/2015.
 */

module.exports = function(composedFunctionalitiesInfo) {
    for (i in composedFunctionalitiesInfo) {
        for (j in composedFunctionalitiesInfo[i].isComposedOf) {
            for (k in composedFunctionalitiesInfo) {
                if (composedFunctionalitiesInfo[i].isComposedOf[j] == composedFunctionalitiesInfo[k].id) {
                    composedFunctionalitiesInfo[i].isComposedOf[j] = null;
                    composedFunctionalitiesInfo[i].isComposedOf = composedFunctionalitiesInfo[i].isComposedOf.concat(composedFunctionalitiesInfo[k].isComposedOf);
                }
            }
        }
    }
    // Clean the composed functionalities
    for (i in composedFunctionalitiesInfo) {
        for (j in composedFunctionalitiesInfo[i].isComposedOf) {
            if (composedFunctionalitiesInfo[i].isComposedOf[j] == null) {
                composedFunctionalitiesInfo[i].isComposedOf.splice(j, 1);
            }
        }
    }
    return composedFunctionalitiesInfo;
}