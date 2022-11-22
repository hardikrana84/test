
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonContent, IonSlides, NavController, LoadingController } from '@ionic/angular';
import { AbstractControl, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Plugins, CameraResultType, CameraSource, CameraOptions } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { PhotoService } from '../services/photo.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { delay, retry } from 'rxjs/operators';
import * as _ from 'lodash';
import { AlertController } from '@ionic/angular';
import { GlobalConstants } from 'src/common/globalconstants';
import { Storage } from '@ionic/storage-angular';
import { stringify } from 'querystring';





const { Camera } = Plugins;
const reader = new FileReader();
@Component({
  selector: 'app-multi-step-form',
  templateUrl: './multi-step-form.page.html',
  styleUrls: ['./multi-step-form.page.scss'],
})
export class MultiStepFormPage implements OnInit 
{

  

  @ViewChild(IonContent, { static: true }) ionContent: IonContent;
  @ViewChild('fileInp') fileInput: ElementRef;


  private retryDelay: number = 1000;

  privacy: boolean;
  terms: boolean;
  subscriber: boolean;
  clientId: string;

  //https://jjfzqcuujg.execute-api.af-south-1.amazonaws.com/test/sab-applicant-post

  APIURL: string = "https://api-test.beesaccount.com/";
  // CDNURL: string = "https://cdn.whozhoo.com/tdo/apps/";

  ChangeOwner: any = '';

  EntityInformation: any = {
    CurrentCTP: '',
    TypeofAccount:'',
    LegalEntity:'',
    TradingName:''
  };
  

  LiquorLicense: any = {
    RegisteredOutletName:'',
    RegisteredNumber:'',
    LiquorLicenseNumber:'',
    LiquorLicenseType:'',
    LiquorLicenseHolder:'',
    StreetNumber:'',
    StreetName:'',
    Suburb:'',
    City:'',
    PostalCode:''
  };

  OwnerDetails: any = {
    NumberOfOwners:'',
    OwnerTitle:'',
    OwnerName:'',
    OwnerSurname:'',
    IdNumber:'',
    DateofBirth:'',
    Nationality:'',
    EmailAddress:'',
    MobileNumber:'',
    MaritalStatus:'',
    SpouseName:'',
    SpouseSurname:'',
    SpouseIDNumber:'',
    StreetNumber:'',
    StreetName:'',
    Suburb:'',
    City:'',
    PostalCode:'',
  };

  FinancialInformation: any = {
    PayForYourAccount:'',
    PaymentMethod:'',
    CreditLimit:'',
    VatNumber:'',
    OwnershipSelector:'',
    PropertybondedSelector:'',
    PropertySecurity:'',
  };

  Affordability: any = {
    GrossIncome:'',
    NetIncome:'',
    OtherIncome:'',
    PropertyExpense:'',
    VehicleExpense:'',
    CreditAgreements:'',
    OtherExpenses:'',
    TotalIncome:'',
    TotalExpenses:'',
    TotalAvailable:'',
    StorageCapacityinCases:'',
    PhotoOfID:'',
    PhotoOfLiquorLicense:'',
    RenewalReceipt:'',
    SpouseIDApplicable:'',
  };   

  Declaration: any = {
    Alleviation:'',
  };
    


  imagePath: SafeResourceUrl;

  times = [];

  slidesOpts = {
    allowTouchMove: false,
    autoHeight: true,
  };

  slides: string[];
  public currentSlide: string;
  public routePath: string = '';
  captureSlides = ['owner-details','affordability','affordability-doc','financial-information'];

  isBeginning = true;
  isEnd = false;


  isChecked = [];

  tokenValid: boolean = false;
  ClientId: string = '1';
  //token: string = '';
  
  
  selectedFile: string = 'No File Selected';
  IdNumber: string = '';
  stepNumber: number = 1;
  baseEncodedImage: any;

  applicantDetail: any = {
    EmailAddress: '',

  };

  constructor(private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private storage: Storage,

  ) {
    this.route.paramMap.subscribe(params => 
      {
        //this.token = params.get('token');
      
      // let pathname = params.get('pathname');
       this.currentSlide = params.get('pathname');

        // if (this.currentSlide == 'credit-check') {
        //   this.getApplicant();
        // }
      // if (this.token == '') {
      //   this.navCtrl.navigateForward('/unauthorised');
      // }
    });
  }

  ngOnInit() {
    
    this.buildSlides(this.currentSlide);
    // this.loadStorageNInitiaNteClientSpecs()
    this.fetchApplicantInfo()
  }

  // async loadStorageNInitiateClientSpecs() {
  //   // If using a custom driver:
  //   // await this.storage.defineDriver(MyCustomDriver)
  //   await this.storage.create();
  //   // Load style based on clientId
  //   this.storage.get('client_id').then((val) => {
  //     this.clientId = val
  //     if (val != null) {
  //       let style = this.clientId + '.css';
  //       this.loadStyle(style)
  //     }
  //   })
  // }



  navigateToRoute(route: string) {
    
    this.navCtrl.navigateForward(route );
    // this.currentSlide = route
  }

  ionViewDidEnter() {

  }

  ionViewWillEnter() {

  }

  goTo(index) {
    this.currentSlide = this.steps[index];
  }
  onClick() {
    this.fileInput.nativeElement.click();
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: '',
      subHeader: 'Error',
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();
  }



  public steps = [
    'entity-information',
    'liquor-license',
    'owner-details',
    'financial-information',
    "affordability",
    "affordability-doc",
    'declaration',
    "credit-check",
    "poi-upload",
    'final-confirmation'
  ];
  public nextSteps: any = 
  {
    "entity-information": 
    {
      "no": 1,
      'isChecked': false,
      "label": "Entity Information",
      "function": "entityInformation",
      "api": "/public/tdo/entity-information",

    },
    "liquor-license": {
      "no": 2,
      'isChecked': true,
      "label": "Liquor License Information",
      "function": "liquorLicenseInfo",
      "api": "/v2/public/tdo/liquor-license"
    },
    "owner-details": {
      "no": 3,
      'isChecked': false,
      "label": "Owner Details",
      "function": "ownerDetails",
      "api": "/v2/public/tdo/document",
    },
    "financial-information": {
      "no": 4,
      'isChecked': false,
      "label": "Financial Information",
      "function": "financialInformation",
      "api": "/v2/public/tdo/document",
      "image": "",
      "base64Image": '',
    },
    "affordability": {
      "no": 5,
      'isChecked': false,
      "label": "Affordability",
      "function": "affordability",
      "api": "/v2/public/tdo/document",
      "image": "",
      "base64Image": '',
    },
    "affordability-spouse": {
      "no": 6,
      'isChecked': false,
      "label": "Affordability",
      "function": "affordabilityDoc",
      "api": "/v2/public/tdo/document",
      "image": "",
      "base64Image": '',
    },
    "declaration": {
      "no": 7,
      'isChecked': false,
      "label": "Declaration",
      "function": "postDeclaration",
      "api": "/v2/public/tdo/document",
      "image": "",
      "base64Image": '',
    },
    "credit-check": {
      "no": 6,
      'isChecked': false,
      "label": "Credit Check",
      "function": "postCreditCheck",
      "api": "/public/tdo/applicant/address"
    },
    "documentation": {
      "no": 7,
      'isChecked': false,
      "label": "Proof of Income",
      "function": "postPOI",
      "api": "/v2/public/tdo/document",
      "image": "",
      "base64Image": '',
    },
    "final-confirmation": {
      "no": 8,
      'isChecked': false,
      "label": "Complete",
      "function": "finalConfirmation",
      "api": "",
    },
    "identity-invalid": {
      "no": 9,
      'isChecked': false,
      "label": "Identity Invalid",
      "function": "",
      "api": "",
    }
  };

  objectKeys = this.nextSteps.keys;


  buildSlides(route: string) {
    const slides = [
      'Entity Information',
      'Liquor License Information',
      'Owner Details',
      'Financial Information',
      'Affordability',
      'Affordability',
      'Declaration',
      'Credit Check',
      'Complete'
    ];

    this.slides = slides;
  }
 
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  async chooseImage(key) {

    try {
      let options: CameraOptions = {
        quality: 70,
        width: 600,
        height: 600,
        preserveAspectRatio: true,
        allowEditing: true,
        correctOrientation: true,
        source: CameraSource.Camera,
        resultType: CameraResultType.Uri,
      };
      const image = await Camera.getPhoto(options);
    
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);
      
      this.nextSteps[key]['image'] = safeUrl;

      const response = await fetch(image.webPath);
      const blob = await response.blob();

      const max_size = 20971520;
      
      var base64String = await this.convertBlobToBase64(blob) as string;

      var stringLength = base64String.length - 'data:image/png;base64,'.length;

      var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
      var sizeInKb=sizeInBytes/1000;
     // console.log(sizeInKb);
      console.log(sizeInBytes);
      if(sizeInBytes <= max_size){
        this.nextSteps[key]['base64Image'] = base64String;
      }else{
        this.presentAlert('Maximum image upload size is 2MB');
      }
    } catch (error) {
      console.warn(error);
    }

  }

  async presentCamera(key) {
    this.chooseImage(key);
  }

  loading: any;
  async takeStep() {
    this.loading = await this.loadingCtrl.create({
      message: '',
      duration: 10000,
    });
    this.loading.present();
    await this[this.nextSteps[this.currentSlide]['function']]();
    this.stepNumber++;
  }

  fetchApplicantInfo() {
    // this.loading.present();
    // let appUrl = GlobalConstants.APIURL + '/public/tdo/application';
    // this.http.post(appUrl, { token: this.token }).subscribe(data => {
    //   let dataResp: any = data;
    //   this.tokenValid = dataResp.TokenValid;
    //   console.log(dataResp);
    //   if (dataResp.TokenValid) {
    //     this.clientId = dataResp.ClientId;
    //     this.ClientId = String(dataResp.ClientId);
    //     this.storage.set('client_id', this.ClientId);
    //     //do nothing for now
    //   }
    // }, error => {
    // //  this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // });
  }
  

  async entityInformation() {

    if(GlobalConstants.sab_applicant_guid != null && GlobalConstants.sab_applicant_guid != "")
    {
      var ptoken = GlobalConstants.sab_applicant_guid.toString();
      const paBody = { change_ownership: this.ChangeOwner, current_ctp: this.EntityInformation.CurrentCTP, account_type: this.EntityInformation.TypeofAccount, entity_type: this.EntityInformation.LegalEntity, trading_name: this.EntityInformation.TradingName,sab_applicant_guid: ptoken};
      this.PostAPI(paBody);
    }
    else
    {
      const paBody = { change_ownership: this.ChangeOwner, current_ctp: this.EntityInformation.CurrentCTP, account_type: this.EntityInformation.TypeofAccount, entity_type: this.EntityInformation.LegalEntity, trading_name: this.EntityInformation.TradingName,sab_applicant_guid: ""};
      this.PostAPI(paBody);
    }
   
  }

  liquorLicenseInfo() 
  {
    //console.log(GlobalConstants.sab_applicant_guid);
    
    const paBody = { sab_applicant_guid: GlobalConstants.sab_applicant_guid.toString(),outlet_name: this.LiquorLicense.RegisteredOutletName, registration_number: this.LiquorLicense.RegisteredNumber, ll_number: this.LiquorLicense.LiquorLicenseNumber, ll_type: this.LiquorLicense.LiquorLicenseType, ll_holder_name: this.LiquorLicense.LiquorLicenseHolder, ll_address_street_no: this.LiquorLicense.StreetNumber, ll_address_street_name: this.LiquorLicense.StreetName, ll_suburb: this.LiquorLicense.Suburb, ll_city: this.LiquorLicense.City, ll_postal_code: this.LiquorLicense.PostalCode};
    this.PostAPI(paBody);
    
   
  }
  checkIdNumber(token: string, ClientId: string, idNumber: string) {
    var idCheckUrl = GlobalConstants.APIURL + this.nextSteps[this.currentSlide]['api'];
    return this.http.post(idCheckUrl, { token: token, clientId: ClientId, idNumber: idNumber });
  }

  ownerDetails() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };
    const paBody = { od_no_of_owners: this.OwnerDetails.NumberOfOwners, od_title: this.OwnerDetails.OwnerTitle, od_name: this.OwnerDetails.OwnerName, od_surname: this.OwnerDetails.OwnerSurname, od_id_number: this.OwnerDetails.IdNumber, od_dob: this.OwnerDetails.DateofBirth, od_nationality: this.OwnerDetails.Nationality, od_email: this.OwnerDetails.EmailAddress, od_mobile_no: this.OwnerDetails.MobileNumber, od_marital_status: this.OwnerDetails.MaritalStatus, od_spouse_name: this.OwnerDetails.SpouseName, od_spouse_surname: this.OwnerDetails.SpouseSurname, od_spouse_id_number: this.OwnerDetails.SpouseIDNumber, od_street_no: this.OwnerDetails.StreetNumber, od_street_name: this.OwnerDetails.StreetName, od_suburb: this.OwnerDetails.Suburb, od_city: this.OwnerDetails.City, od_postal_code: this.OwnerDetails.PostalCode, od_sales_name_1: this.OwnerDetails.SalesName, od_sales_email_1: this.OwnerDetails.SalesEmail, od_sales_mno_1: this.OwnerDetails.SalesMobile, od_delivery_name_1: this.OwnerDetails.DeliveryName, od_delivery_email_1: this.OwnerDetails.DeliveryEmail, od_delivery_pincode_3: this.OwnerDetails.DeliveryMobile, od_finance_name: this.OwnerDetails.FinanceName, od_finance_email: this.OwnerDetails.FinanceEmail, od_finance_pincode: this.OwnerDetails.FinancePincode, od_finance_mobila_no: this.OwnerDetails.FinanceMobile};
    console.log(paBody)

    // var appPostUrl = GlobalConstants.APIURL + '/v2/public/tdo/document';
    // this.http.post(appPostUrl, paBody, httpOptions).pipe(retry(3), delay(this.retryDelay)).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // })
    this.gotToNextPage('financial-information');
  }

  financialInformation() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };
    // const paBody = { token: this.token, clientId: this.ClientId, image: this.nextSteps[this.currentSlide]['base64Image'], idType: this.IdentitySelector };
    // console.log(paBody)

    // var appPostUrl = GlobalConstants.APIURL + '/v2/public/tdo/document';
    // this.http.post(appPostUrl, paBody, httpOptions).pipe(retry(3), delay(this.retryDelay)).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // })
    this.gotToNextPage('affordability');
  }


  affordability() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };
    // const paBody = { token: this.token, clientId: this.ClientId, image: this.nextSteps[this.currentSlide]['base64Image'], idType: 'drivers_license_front' };
    // console.log(paBody)

    // var appPostUrl = GlobalConstants.APIURL + '/v2/public/tdo/document';
    // this.http.post(appPostUrl, paBody, httpOptions).pipe(retry(3), delay(this.retryDelay)).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // })
    this.gotToNextPage('affordability-doc');
  }
  affordabilityDoc() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };
    // const paBody = { token: this.token, clientId: this.ClientId, image: this.nextSteps[this.currentSlide]['base64Image'], idType: 'drivers_license_back' };
    // console.log(paBody)

    // var appPostUrl = GlobalConstants.APIURL + '/v2/public/tdo/document';
    // this.http.post(appPostUrl, paBody, httpOptions).pipe(retry(3), delay(this.retryDelay)).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     //this.getApplicant();
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // })
    this.gotToNextPage('declaration');
  }


  // getApplicant() {
  //   this.storage.get('client_id').then((val) => {
  //     if (val != null) {
  //       this.ClientId = val
  //       var url = GlobalConstants.APIURL + this.nextSteps[this.currentSlide]["api"];
  //       this.http.get(url + '?token=' + this.token + '&infotype=identity' + '&clientId=' + this.ClientId).subscribe(data => {
  //         let resp: any = data;
  //         this.applicantDetail = resp;
  //       })
  //     }
  //   })
  // }

  UpdateApplicant: boolean = false;
  DetailsValid: boolean = true;
  invalidInfo() {
    this.DetailsValid = false;
    this.takeStep();
  }
  validInfo() {
    this.DetailsValid = true;
    this.takeStep();
  }

  imageError: any = '';
  isImageSaved: boolean = false;
  cardImageBase64: string = '';

  fileChangeEvent(fileInput: any) {
    this.imageError = '';
    if (fileInput.target.files && fileInput.target.files[0]) {
      // Size Filter Bytes
      const max_size = 20971520;
      //const allowed_types = ['image/png', 'image/jpeg', 'application/pdf'];
      const allowed_types = ['application/pdf', 'image/jpeg'];
      const max_height = 15200;
      const max_width = 25600;

      if (fileInput.target.files[0].size > max_size) {
        this.imageError =
          'Maximum size allowed is ' + max_size / 1000 + 'Mb';

        return false;
      }

      if (!_.includes(allowed_types, fileInput.target.files[0].type)) {
        //this.imageError = 'Only Images are allowed ( JPG | PNG | PDF )';
        this.imageError = 'Only ( JPG | PDF ) are allowed';
        return false;
      }

      reader.onload = (e: any) => {

        const imgBase64Path = e.target.result;
        this.nextSteps[this.currentSlide]['image'] = imgBase64Path;
        console.log('selected file', fileInput.target.files[0].name);
        this.selectedFile = fileInput.target.files[0].name;
        this.isImageSaved = true;
        // this.previewImagePath = imgBase64Path;

      };
    };

    reader.readAsDataURL(fileInput.target.files[0]);
    return true;
  }

  postDeclaration() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };

    // const paBody = { token: this.token, clientId: this.ClientId, image: this.nextSteps[this.currentSlide]['image'], idType: 'poa' };
    // console.log(paBody)
    // var appPostUrl = GlobalConstants.APIURL + this.nextSteps[this.currentSlide]['api'];
    // this.http.post(appPostUrl, paBody, httpOptions).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.currentSlide = 'poi';
    //   // this.presentAlert(error.message);
    //   this.loading.dismiss();
    //   this.navigateToRoute(this.currentSlide);
    //   this.currentSlide = '';
    // })
    this.gotToNextPage('credit-check');
  }


  postPOI() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };

    // const paBody = { token: this.token, clientId: this.ClientId, image: this.nextSteps[this.currentSlide]['image'], idType: 'poi-1' };
    // console.log(paBody)
    // var appPostUrl = GlobalConstants.APIURL + this.nextSteps[this.currentSlide]['api'];
    // this.http.post(appPostUrl, paBody, httpOptions).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // })
  }

  Addressline1: string = '';
  Addressline2: string = '';

  Suburb: string = '';
  City: string = '';
  PostalCode: string = '';

  postCreditCheck() {
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json'
    //   })
    // };

    // const paBody = { token: this.token, clientId: this.ClientId, infoType: 'address', updateApplicant: this.UpdateApplicant, Addressline1: this.Addressline1, Addressline2: this.Addressline2, Suburb: this.Suburb, City: this.City, PostalCode: this.PostalCode };
    // console.log('paBody:' + paBody)
    // var appPostUrl = GlobalConstants.APIURL + this.nextSteps[this.currentSlide]['api'];
    // this.http.post(appPostUrl, paBody, httpOptions).subscribe(resp => {
    //   let dataResp: any = resp;
    //   this.loading.dismiss();
    //   this.tokenValid = dataResp.TokenValid;
    //   if (this.tokenValid) {
    //     this.processRespData(dataResp);
    //   }
    // }, error => {
    //   this.loading.dismiss();
    //   // this.presentAlert(error.message);
    //   this.currentSlide = '';
    // })
    this.gotToNextPage('final-confirmation');
  }

  // loadStyle(styleName: string) {
  //   const head = document.getElementsByTagName('head')[0];

  //   let themeLink = document.getElementById(
  //     'client-theme'
  //   ) as HTMLLinkElement;
  //   if (themeLink) {
  //     themeLink.href = GlobalConstants.CDNURL + 'css/' + styleName;
  //   } else {
  //     const style = document.createElement('link');
  //     style.id = 'client-theme';
  //     style.rel = 'stylesheet';
  //     style.href = `${GlobalConstants.CDNURL + 'css/' + styleName}`;

  //     head.appendChild(style);
  //   }
  // }

  processRespData(dataResp) {
    this.isChecked[this.currentSlide] = true;
    if (dataResp.NextStep instanceof Array) {
      this.currentSlide = dataResp.NextStep[0];
    } else {
      this.currentSlide = dataResp.NextStep;
    }
    // this.ClientId = String(dataResp.client_id);
    this.loading.dismiss();
    this.ionContent.scrollToTop();
    this.navigateToRoute(this.currentSlide);
  }

  goBackHome() {
    this.navigateToRoute('entity-information')
  }

  gotToNextPage(slide: string) {
    this.currentSlide = slide;
    this.navigateToRoute(this.currentSlide);
  }




  PostAPI(paBody)
  {
    
    console.log(paBody);
    
    var url = GlobalConstants.APIURL + "sab-applicant-post";
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };

      this.http.post(url, paBody, httpOptions).subscribe(data => {
        let dataResp: any = data;
       if(dataResp.statusCode == "400")
       {
          this.loading.dismiss();
          this.currentSlide = '';
          return false;
       }
        if(dataResp != null &&  dataResp.body != null)
        {
          var returnGUID =  JSON.parse(dataResp.body.sab_applicant_guid).toString();
          if(GlobalConstants.sab_applicant_guid != null && GlobalConstants.sab_applicant_guid != "" && GlobalConstants.sab_applicant_guid !=  returnGUID)
          {
            this.loading.dismiss();
            this.currentSlide = '';
            return false;
          }
          //debugger;
          GlobalConstants.sab_applicant_guid = returnGUID;
          var nextStep = JSON.parse(dataResp.body.nextSteps);
          var nextslide = "";
          for (let i = 0; i < nextStep.length ; i++) 
          {
            if(nextStep[i].toString().toLowerCase() == this.currentSlide.toLowerCase())
            {
              nextslide = nextStep[i + 1];
              break;
            }
          }
        }
        else
        {
          this.loading.dismiss();
          this.currentSlide = '';
        }
        this.gotToNextPage(nextslide);
      }, error => {
        console.log(error.message);
        this.loading.dismiss();
        this.currentSlide = '';
      });
  }
}
