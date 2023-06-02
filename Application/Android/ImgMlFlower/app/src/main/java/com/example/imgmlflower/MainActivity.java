package com.example.imgmlflower;



import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.example.imgmlflower.ml.TfliteSequential;

import org.tensorflow.lite.DataType;
import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.label.Category;
import org.tensorflow.lite.support.tensorbuffer.TensorBuffer;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private ImageView imgView;
    private Button select, predict;
    private TextView txView;
    private Bitmap img;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        imgView = (ImageView) findViewById(R.id.imageView);
        select = (Button) findViewById(R.id.button);
        predict = (Button) findViewById(R.id.button2);
        txView = (TextView) findViewById(R.id.textView);

        select.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("image/*");
                someActivityResultLauncher.launch(intent);
            }
        });

        predict.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                img = Bitmap.createScaledBitmap(img, 180, 180, true);

                try {
                    long startTime = System.currentTimeMillis();

                    TfliteSequential model = TfliteSequential.newInstance(getApplicationContext());

                    // Creates inputs for reference.
                    TensorBuffer inputFeature0 = TensorBuffer.createFixedSize(new int[]{1, 180, 180, 3}, DataType.UINT8);

                    TensorImage tensorImage = new TensorImage(DataType.UINT8);
                    TensorImage image = TensorImage.fromBitmap(img);
                    tensorImage.load(img);
                    ByteBuffer byteBuffer = tensorImage.getBuffer();

                    inputFeature0.loadBuffer(byteBuffer);

                    // Runs model inference and gets result.
                    TfliteSequential.Outputs outputs = model.process(tensorImage);
                    List<Category> probability = outputs.getProbabilityAsCategoryList();
                    //TensorBuffer outputFeature0 = outputs.getOutputFeature0AsTensorBuffer();

                    // Releases model resources if no longer used.

                    model.close();
                    String hold = "";
                    int count = 0;
//                    for(int i = 0; i < probability.size(); i++){
//
//                        if(i+1 != probability.size()){
//                            if(probability.get(i).getScore() > probability.get(i+1).getScore()){
//                                hold = probability.get(i).getLabel();
//
//
//                            }
//                            else{
//                                hold = probability.get(i+1).getLabel();
//                            }
//
//                        }
//
//                    }
                    float score =0;
                    int index = 0;
                    for(int i = 0; i < probability.size(); i++){
                        int tmp_count = 0;
                        for(int j = 0; j < probability.size(); j++){
                            System.out.println(probability.get(j).getScore());
                            if(probability.get(i).getScore() > probability.get(j).getScore()){
                                if(probability.get(i).getScore() > score){
                                    score = probability.get(i).getScore();
                                    index = i;

                                }

                                tmp_count ++;


                            }


                        }
//                        if(tmp_count == probability.size()){
//                            hold = probability.get(i).getLabel();
//                        }
                    }
                    hold = probability.get(index).getLabel();
                    //txView.setText(probability.get(0).getScore() + "\n" + probability.get(1).getScore() + "\n" + probability.get(2).getScore() + "\n" + probability.get(3).getScore() + "\n" + probability.get(4).getScore() + "\n" );
                    long endTime = System.currentTimeMillis()-startTime;
                    txView.setText(hold + " " +"Runtime Latency:" + endTime +"ms");




                } catch (IOException e) {
                    // TODO Handle the exception
                    e.printStackTrace();
                }

            }
        });
    }

    ActivityResultLauncher<Intent> someActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override
                public void onActivityResult(ActivityResult result) {
                    if (result.getResultCode() == Activity.RESULT_OK) {
                        // There are no request codes
                        Intent data = result.getData();
                        imgView.setImageURI(data.getData());

                        Uri uri = data.getData();
                        try {
                            img = MediaStore.Images.Media.getBitmap(getApplicationContext().getContentResolver(), uri);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            });
}