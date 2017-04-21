/**
 * Created by root on 21/04/17.
 */

function compareDatesBetweenReviews(reviewA,reviewB) {
    if (reviewA.date > reviewB.date)
        return -1;
    if (reviewA.date < reviewB.date)
        return 1;
    return 0;
}

module.exports = {

    orderReviewsByDate : function (attraction){
        if (attraction.reviews.length > 0){
            attraction.reviews.sort(compareDatesBetweenReviews);
        }
    }

};