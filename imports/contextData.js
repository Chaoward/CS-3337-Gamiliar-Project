const OUTDATE_TIME = 360000;    //miliseconds
const MAX_ATTRIBUTES = 25;      //maximum amount of attributes before cleaning
const ATT = new Object();
ATT.length = () => {return Object.keys(ATT).length};

module.exports = {
    getAttribute,
    setAttribute,
    removeAttribute,
    forEach
};



//===== PRIVATE FUNCTIONS and CLASS STRUCTURES =============================
class Attribute {
    constructor(d, isPerm) {
        this.timestamp = isPerm ? -1 : new Date();
        this.metadata = d;
    }

    isValid() {
        return this.timestamp < 1 ? true : Date.now() - this.timestamp.getTime() < OUTDATE_TIME;
    }
}

function clean() {
    let deleted = false;
    let latest = null;

    //delete all elements if timestamps is outdated or metatdata is null
    forEach( (key, attribute) => {
        if (!attribute.isValid() || attribute.metadata == null) {
            delete ATT[key];
            deleted = true;
        }
        else
            latest = key;
    });

    //if no elements are deleted, delete the first largest timestamped item
    if (!deleted) {
        delete ATT[latest];
    }
}
//=============================================================================


//===== setAttribute ================================
/** Sets the given name with an attribute created by
 *  the metadata passed in. Updates current attribute
 *  by replacing it with a new instance.
 * 
 *  permanent: bool
 *      * determines if the attribute stays permanently
 *        (Use Sparingly)
 */
//===================================================
function setAttribute(name, data, permanent=false) {
    //update existing attribute
    if (ATT[String(name)]) {
        ATT[String(name)] = new Attribute(data, permanent);
        return;
    }

    if ( ATT.length() >= MAX_ATTRIBUTES)
        clean();

    //create new attribute to save
    const newEntry = new Attribute(data, permanent);

    ATT[String(name)] = newEntry;
}


//===== getAttribute ==================================
/** returns the metadata of the attribute by the given
 *  name passed in. Returns null if attribute is out-of-date
 *  or not found. Will update the timestamp everytime it
 *  is founded and returned.
*/
//=====================================================
function getAttribute(name) {
    const curAtt = ATT[String(name)];

    if (ATT.length() >= MAX_ATTRIBUTES)
        clean();
    
    if (curAtt && curAtt.isValid()) {
        //reset timestamp
        ATT[String(name)].timestamp = new Date();
        return ATT[String(name)].metadata;
    }

    //delete outdated or not found
    if (curAtt) 
        delete ATT[String(name)];
    return null;
}


//===== removeAttribute ============================
/** Deletes the attribute of the given name from the
 *  ATT object. Returns the deleted metadata or null
 *  if not found.
 */
//==================================================
function removeAttribute(name) {
    if (ATT[String(name)]) {
        let returnData = getAttribute(name);
        delete ATT[String(name)];
        return returnData;
    }

    return null;
}


//===== forEach =====================================
/** A forEach function that executes the callback
 *  passing both key and value from ATT.
 */
//===================================================
function forEach( callback ) {
    for (const key of Object.keys(ATT))
        callback(key, ATT[key]);
}